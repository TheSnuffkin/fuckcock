const axios = require("axios");
const delay = require("delay");
var bigData = [];
const { Webhook, MessageBuilder } = require("discord-webhook-node");
module.exports = class Sniper {
  constructor(collection, tid, price, hook, delay) {
    this.collection = collection;
    this.tid = tid;
    this.price = parseInt(price);
    this.response;
    this.hook = hook;
    this.hook = new Webhook(this.hook);
    this.result;
    this.delay = parseInt(delay);
    this.canceled = false;
    this.suggested;
    this.proxy = {
      host: "3.20.206.131",
      port: 3128,
      auth: {
        username: "user",
        password: "porcodio",
      },
    };
  }

  async getResults() {
    this.response = await axios.get(
      `http://wax.api.atomicassets.io/atomicmarket/v2/sales?state=1collection_name=${this.collection}&template_id=${this.tid}&page=1&limit=100&order=desc&sort=created`
    );
    this.result = this.response.data.data;
    let currentPrice;
    for (let sale in this.result) {
      currentPrice = parseFloat(this.result[sale].price.amount);
      if (currentPrice <= this.suggested - this.suggested * 0.02) {
        this.sendHooks(
          this.collection,
          this.result[sale].sale_id,
          this.tid,
          currentPrice
        );
        console.log("SUCCESS", currentPrice, this.result[sale].sale_id);
        return true;
      }
      return false;
    }
  }

  async monitorCollection() {
    this.response = await axios.get(
      `https://wax.api.atomicassets.io/atomicmarket/v2/sales?state=1&collection_name=${this.collection}&page=1&limit=100&order=desc&sort=created`
    );
    this.result = this.response.data.data;
    let currentPrice;
    for (let sale in this.result) {
      console.log(this.result[sale].assets[0]);
      console.log(this.result[sale].sale_id);
      console.log(
        this.result[sale].assets[0].prices[0].min +
          " " +
          this.result[sale].assets[0].template.template_id
      );
      currentPrice = parseFloat(this.result[sale].price.amount);
      this.suggested = parseFloat(
        this.result[sale].assets[0].prices[0].suggested_median
      );
      console.log("price: " + currentPrice + " median: " + this.suggested);
      console.log(
        "sale: " +
          this.result[sale].sale_id +
          " tid: " +
          this.result[sale].assets[0].template.template_id
      );
      if (currentPrice <= this.suggested - this.suggested * 0.02) {
        this.sendHooks(
          this.collection,
          this.result[sale].sale_id,
          this.result[sale].assets[0].template.template_id,
          currentPrice
        );
        console.log("SUCCESS", currentPrice, this.result[sale].sale_id);
        return true;
      }
    }
    console.log("price not good enough");
    return false;
  }

  async sendHooks(collection, sale_id, tid, price) {
    const IMAGE_URL =
      "https://i.insider.com/5d5ffecaad2b475bbc2775d5?width=1136&format=jpeg";

    this.hook.setUsername("ATOMIC SNIPER");
    this.hook.setAvatar(IMAGE_URL);
    const publicEmbed = new MessageBuilder()
      .setTitle("PEW • Public")
      .addField(
        "CLICK IT BITCH",
        `https://wax.atomichub.io/market/sale/${sale_id}`,
        false
      )
      .addField("Collection", `${collection}`, true)
      .addField("Template ID", `${tid}`, true)
      .addField("Price", `${price}`, true)
      .setColor("#28E55D")
      .setFooter(
        "ATOMIC SNIPER • Beta",
        "https://i.insider.com/5d5ffecaad2b475bbc2775d5?width=1136&format=jpeg"
      )
      .setTimestamp();
    this.hook.send(publicEmbed);
  }

  async start() {
    let config = {
      headers: {
        accept: "application/json",
      },
    };
    console.log("task started");
    console.log(this.tid);
    if (this.tid == "none") {
      while (true) {
        if (this.canceled) {
          return false;
        }
        while (!(await this.monitorCollection())) {
          await delay(this.delay || 1000);
          if (this.canceled) {
            return false;
          }
        }
      }
    }
    while (true) {
      if (this.canceled) {
        return false;
      }
      while (!(await this.getResults())) {
        await delay(this.delay || 1000);
        if (this.canceled) {
          return false;
        }
      }
    }
  }
};
