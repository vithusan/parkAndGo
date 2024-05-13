const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/parking-lots", async (req, res) => {
  try {
    const latitude = req.query.lat;
    const longitude = req.query.lng;
    const browser = await puppeteer.launch({ headless: false });
    // const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(
      `https://lots.impark.com/imp/en?latlng=${latitude},${longitude}&q=Vancouver%20Vancouver%20Metro%20Vancouver`
    );

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    // await page.type("#tbSearch", "Vancouver bc");

    // await page.click("#btnSearch");

    await page.waitForSelector("#lot-search-result-container");

    // Slow down execution to observe the browser
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take a screenshot after waiting
    // await page.screenshot({ path: "screenshot_after_wait.png" });

    // Extract parking lot information
    const parkingLots = await page.evaluate(() => {
      const lots = [];
      const lotElements = document.querySelectorAll(".result_row");
      lotElements.forEach((element) => {
        const lotName = element.querySelector(".lot-name").textContent.trim();
        const lotAddress = element
          .querySelector(".lot-address .address-text")
          .textContent.trim();
        const lotRate = element.querySelector(".lot-rate").textContent.trim();
        lots.push({ lotName, lotAddress, lotRate });
        const lotNumber = element
          .querySelector(".lot-number")
          .textContent.trim();
        lots.push({ lotNumber, lotAddress, lotName, lotRate });
      });
      return lots;
    });
    // const testresult = res.json({
    //   message: "Parking lot data fetched successfully",
    // });
    // const tooManyResultsSpan = await page.$(
    //   ".too_many_results > .txt-too-many"
    // );
    // if (tooManyResultsSpan) {
    //   const tooManyResultsText = await page.evaluate(
    //     (span) => span.textContent,
    //     tooManyResultsSpan
    //   );
    //   res.json("Too many results message:", tooManyResultsText);
    // } else {
    //   res.json("Too many results message not found!");
    // }

    // Take a screenshot after extracting parking lot information
    // await page.screenshot({ path: "screenshot_after_extraction.png" });

    res.json(parkingLots);
    await browser.close();
    // res.json(testing);
  } catch (error) {
    console.error("Error fetching parking lot data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
