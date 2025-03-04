const express = require('express');
const { MyExpress } = require('../lib/express_lite/src/index');
const cors = require('cors');

const createFramework = () => {
  const useCustomExpress = process.env.EXPRESS_IMPLEMENTATION === 'custom';
  
  if (useCustomExpress) {
    console.log('🚀 Using custom Express implementation (MyExpress)');
    
    return {
      createApp: () => new MyExpress(),
      json: MyExpress.json,
      urlencoded: MyExpress.urlencoded,
      cors: MyExpress.cors,
      isCustom: true
    };
  } else {
    console.log('🚀 Using original Express implementation');
    
    return {
      createApp: express,
      json: express.json,
      urlencoded: express.urlencoded,
      cors: cors,
      isCustom: false
    };
  }
};

module.exports = createFramework;