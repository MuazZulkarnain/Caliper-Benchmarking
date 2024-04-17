"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const axios = require("axios");

async function searchProjects() {
  const url = "http://localhost/api/query/search";
  const requestData = {
    query: {
      selector: {
        "@assetType": "project",
      },
    },
  };

  try {
    const response = await axios.post(url, requestData);
    const keysArray = response.data.result.map((project) => project["@key"]);
    return keysArray;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

class MyWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const keysArray = await searchProjects();
    // console.log("Keys Array:", keysArray);

    try {
      const randomId = Math.floor(
        Math.random() * this.roundArguments.assets + 1
      );
      const assetName = `${randomId}`;
      const assetKey = `${keysArray[randomId]}`;
      const amount = Math.floor(Math.random() * 100);
      // Check if assetKey is defined before proceeding
      if (assetKey !== undefined) {
        console.log(
          `Worker ${this.workerIndex}: Tokenizing asset ${assetName} key ${assetKey} with amount ${amount}`
        );

        const tokenizeRequest = {
          contractId: "IoT-cc",
          contractFunction: "tokenizeCarbonCredit",
          invokerIdentity: "User1",
          contractArguments: [
            `{"project": {"@assetType":"project","@key":"${assetKey}"},"amount":${amount}}`,
          ],
          readOnly: false,
        };
        await this.sutAdapter.sendRequests(tokenizeRequest);
      } else {
        console.log(`Asset key for ${assetName} is undefined.`);
        console.log(assetKey);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  }
}

function createWorkloadModule() {
  return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
