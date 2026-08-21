require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ NO KEY FOUND IN .ENV");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Active models directly from your available list
const modelsToTest = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite"
];

async function testModels() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`📡 Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("Hi");
      console.log(`\n✅ SUCCESS! Working model found: ${modelName}`);
      console.log(`AI Response: ${res.response.text().trim()}`);
      return;
    } catch (err) {
      console.log(`❌ Failed (${modelName}): ${err.message.split('\n')[0]}`);
    }
  }
}

testModels();