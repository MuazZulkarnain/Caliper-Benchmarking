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
      const randomIdFrom = Math.floor(
        Math.random() * this.roundArguments.assets
      );
      while (randomIdTo === randomIdFrom) {
        randomIdTo = Math.floor(Math.random() * this.roundArguments.assets);
      }
      const assetNameFrom = `${randomIdFrom}`;
      const assetNameTo = `${randomIdTo}`;
      const assetKeyFrom = `${keysArray[randomIdFrom]}`;
      const assetKeyTo = `${keysArray[randomIdTo]}`;
      const amount = Math.floor(Math.random() * 100);
      // Check if assetKey is defined before proceeding
      if (assetKeyFrom !== undefined || assetKeyTo !== undefined) {
        console.log(
          `Worker ${this.workerIndex}: Transferring ${amount} Carbon Credit from ${assetNameFrom} to ${assetNameTo} `
        );
        // Use the correct contractFunction and contractArguments for tokenizing assets
        const transferRequest = {
          contractId: "IoT-cc",
          contractFunction: "transferCarbonCredit",
          invokerIdentity: "User1",
          contractArguments: [
            `{"fromProject": {"@assetType":"project","@key":"${assetKeyFrom}"},"toProject":{"@assetType":"project","@key":"${assetKeyTo}"},"amount":${amount}}`,
          ],
          readOnly: false,
        };
        await this.sutAdapter.sendRequests(transferRequest);
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
