const fetch = require("node-fetch");
const HttpsProxyAgent = require("https-proxy-agent");
const { SocksProxyAgent } = require("socks-proxy-agent");
const readline = require("readline");
const WebSocket = require('ws');
const crypto = require('crypto');

const banner = `
 #####                                #     #              #                                         
#     # #    # ######  ####  #####    ##   ## ######      # #   # #####  #####  #####   ####  #####  
#     # #    # #      #        #      # # # # #          #   #  # #    # #    # #    # #    # #    # 
#     # #    # #####   ####    #      #  #  # #####     #     # # #    # #    # #    # #    # #    # 
#   # # #    # #           #   #      #     # #         ####### # #####  #    # #####  #    # #####  
#    #  #    # #      #    #   #      #     # #         #     # # #   #  #    # #   #  #    # #      
 #### #  ####  ######  ####    #      #     # ######    #     # # #    # #####  #    #  ####  #      
                                                                                                                                   
                     Telegram Channel @questairdrop
                     
                     Disclaimer:
                     This program is only for learning and communication purposes
                     Any consequences arising from the use of this program are the responsibility of the user
`;


const config = {
  token: "",
  baseUrl: "https://app.despeed.net",
  checkInterval: 60000,
  location: {
    latitude: 39.904202,
    longitude: 116.407394
  },
  proxy: {
    enabled: false,
    type: "http",
    host: "",
    port: "",
    username: "",
    password: "",
    timeout: 10000,
    maxRetries: 3,
    testUrl: "https://api.ipify.org?format=json"
  }
};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}


function parseProxyString(proxyStr) {
  try {
    const [host, port, username, password] = proxyStr.split(':');
    return { host, port, username, password };
  } catch (error) {
    console.error('Proxy format parsing error');
    return null;
  }
}


function validateProxyConfig(proxyConfig) {
  return !!(proxyConfig.host && proxyConfig.port);
}


async function isProxyAlive(proxyAgent) {
  try {
    const response = await fetch(config.proxy.testUrl, {
      agent: proxyAgent,
      timeout: config.proxy.timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}


async function getProxyAgent(retries = config.proxy.maxRetries) {
  if (!config.proxy.enabled) return undefined;
  
  if (!validateProxyConfig(config.proxy)) {
    console.error('Invalid proxy configuration');
    return undefined;
  }

  for (let i = 0; i < retries; i++) {
    try {
      let proxyUrl;
      const auth = config.proxy.username && config.proxy.password 
        ? `${encodeURIComponent(config.proxy.username)}:${encodeURIComponent(config.proxy.password)}@`
        : '';
        
      if (config.proxy.type === 'http') {
        proxyUrl = `http://${auth}${config.proxy.host}:${config.proxy.port}`;
        const agent = new HttpsProxyAgent({
          proxy: proxyUrl,
          timeout: config.proxy.timeout,
          keepAlive: true,
          maxFreeSockets: 256,
          maxSockets: 256
        });
        
        if (await isProxyAlive(agent)) {
          return agent;
        }
      } else {
        proxyUrl = `socks://${auth}${config.proxy.host}:${config.proxy.port}`;
        const agent = new SocksProxyAgent({
          proxy: proxyUrl,
          timeout: config.proxy.timeout,
          keepAlive: true
        });
        
        if (await isProxyAlive(agent)) {
          return agent;
        }
      }
      
      console.warn(`Agent detection failed, try again ${i + 1}/${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      
    } catch (error) {
      console.error(`Agent creation error (${i + 1}/${retries}):`, error.message);
      if (i === retries - 1) {
        throw new Error('Agent creation failed, maximum number of retries reached');
      }
    }
  }
  
  return undefined;
}


function generateRandomLocation() {
  const bounds = {
    minLat: 18.0,
    maxLat: 53.55,
    minLng: 73.66,
    maxLng: 135.05
  };
  
  const latitude = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
  const longitude = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
  
  return {
    latitude: Math.round(latitude * 1000000) / 1000000,
    longitude: Math.round(longitude * 1000000) / 1000000
  };
}


async function initConfig() {
  console.log('Please enter configuration information as prompted...\n');

  config.token = await question('Please enter your DeSpeed token: ');
  
  const useProxy = (await question('Use a proxy? (y/n): ')).toLowerCase() === 'y';
  
  if (useProxy) {
    config.proxy.enabled = true;
    
    let proxyType;
    do {
      proxyType = (await question('Please select agent type (http/socks): ')).toLowerCase();
    } while (proxyType !== 'http' && proxyType !== 'socks');
    
    config.proxy.type = proxyType;
    
    const proxyStr = await question('Please enter proxy configuration (format: ip:port:username:password): ');
    const proxyInfo = parseProxyString(proxyStr);
    
    if (proxyInfo) {
      Object.assign(config.proxy, proxyInfo);
    } else {
      console.log('Proxy format is wrong, proxy will not be used');
      config.proxy.enabled = false;
    }
  }

  const interval = await question('Please enter the check interval (minutes, default 1 minute): ');
  config.checkInterval = (parseInt(interval) || 1) * 60000;

  config.location = generateRandomLocation();
  console.log('\nThe speed measurement location has been randomly generated:', config.location);

  rl.close();
  
  console.log('\nConfiguration information has been saved!');
  console.log('Current configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n');
}


function getCommonHeaders() {
  return {
    'Authorization': `Bearer ${config.token}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'sec-ch-ua': '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Origin': 'https://app.despeed.net',
    'Referer': 'https://app.despeed.net/dashboard'
  };
}


async function validateToken() {
  if (!config.token) {
    throw new Error('Token not found');
  }
  
  const tokenData = JSON.parse(atob(config.token.split('.')[1]));
  if ((tokenData.exp - 90) * 1000 < Date.now()) {
    throw new Error('Token expired');
  }

  const proxyAgent = await getProxyAgent();
  const profileResponse = await fetch(`${config.baseUrl}/v1/api/auth/profile`, {
    headers: getCommonHeaders(),
    agent: proxyAgent,
    timeout: 30000
  });

  if (!profileResponse.ok) {
    throw new Error('Token invalid');
  }
}


async function performSpeedTest() {
  try {
    console.log('Testing network speed...');
    
    const metadata = {
      client_name: 'speed-measurementlab-net-1',
      client_session_id: crypto.randomUUID()
    };

    const proxyAgent = await getProxyAgent();
    
    const locateUrl = new URL('https://locate.measurementlab.net/v2/nearest/ndt/ndt7');
    locateUrl.search = new URLSearchParams(metadata).toString();
    
    console.log('Get speed test server...');
    const locateResponse = await fetch(locateUrl, {
      agent: proxyAgent,
      timeout: 30000
    });

    if (!locateResponse.ok) {
      throw new Error(`Failed to obtain speed test server: ${locateResponse.status}`);
    }

    const serverData = await locateResponse.json();
    if (!serverData.results || !serverData.results[0]) {
      throw new Error('No speed test server available');
    }

    const server = serverData.results[0];
    console.log(`Select speed test server: ${server.machine}`);

    const downloadUrl = server.urls['wss:///ndt/v7/download'];
    const uploadUrl = server.urls['wss:///ndt/v7/upload'];


    console.log('Start downloading speed test...');
    let downloadSpeed = 0;
    await new Promise((resolve) => {
      const wsOptions = config.proxy.enabled ? {
        agent: proxyAgent
      } : undefined;
      
      const ws = new WebSocket(downloadUrl, 'net.measurementlab.ndt.v7', wsOptions);
      let startTime = Date.now();
      let totalBytes = 0;
      let lastMeasurement = null;

      ws.on('open', () => {
        startTime = Date.now();
        totalBytes = 0;
      });

      ws.on('message', (data) => {
        if (typeof data === 'string') {
          lastMeasurement = JSON.parse(data);
          return;
        }
        totalBytes += data.length;
        const now = Date.now();
        const duration = (now - startTime) / 1000;
        if (duration >= 10) {
          downloadSpeed = (totalBytes * 8) / (duration * 1000000);
          ws.close();
        }
      });

      ws.on('close', () => {
        console.log(`Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
        resolve();
      });

      ws.on('error', (error) => {
        console.error('Download speed test error:', error);
        resolve();
      });
    });


    console.log('Start uploading speed test...');
    let uploadSpeed = 0;
    await new Promise((resolve) => {
      const wsOptions = config.proxy.enabled ? {
        agent: proxyAgent
      } : undefined;
      
      const ws = new WebSocket(uploadUrl, 'net.measurementlab.ndt.v7', wsOptions);
      let startTime = Date.now();
      let totalBytes = 0;
      let lastMeasurement = null;
      let uploadData = Buffer.alloc(32768);
      crypto.randomFillSync(uploadData);

      ws.on('open', () => {
        startTime = Date.now();
        totalBytes = 0;
        const sendData = () => {
          if (ws.readyState === WebSocket.OPEN) {
            const now = Date.now();
            const duration = (now - startTime) / 1000;
            
            if (duration >= 10) {
              uploadSpeed = (totalBytes * 8) / (duration * 1000000);
              ws.close();
              return;
            }

            while (ws.bufferedAmount < 1024 * 1024) {
              ws.send(uploadData);
              totalBytes += uploadData.length;
            }

            setImmediate(sendData);
          }
        };
        sendData();
      });

      ws.on('message', (data) => {
        if (typeof data === 'string') {
          try {
            lastMeasurement = JSON.parse(data);
            if (lastMeasurement.TCPInfo) {
              const tcpInfo = lastMeasurement.TCPInfo;
              const tmpSpeed = (tcpInfo.BytesReceived / tcpInfo.ElapsedTime) * 8;
              if (tmpSpeed > uploadSpeed) {
                uploadSpeed = tmpSpeed;
              }
            }
          } catch (e) {
            console.error('Error parsing server message:', e);
          }
        }
      });

      ws.on('close', () => {
        console.log(`Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
        resolve();
      });

      ws.on('error', (error) => {
        console.error('Upload speed test error:', error);
        resolve();
      });
    });

    return {
      downloadSpeed,
      uploadSpeed
    };

  } catch (error) {
    console.error('An error occurred during the speed test:', error.message);
    return {
      downloadSpeed: 0,
      uploadSpeed: 0
    };
  }
}


async function reportResults(downloadSpeed, uploadSpeed) {
  try {
    console.log('Reporting...');

    const proxyAgent = await getProxyAgent();
    const response = await fetch(`${config.baseUrl}/v1/api/points`, {
      method: 'POST',
      headers: {
        ...getCommonHeaders(),
        'Content-Type': 'application/json'
      },
      agent: proxyAgent,
      timeout: 30000,
      body: JSON.stringify({
        download_speed: Math.round(downloadSpeed * 100) / 100,
        upload_speed: Math.round(uploadSpeed * 100) / 100,
        latitude: config.location.latitude,
        longitude: config.location.longitude,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Report failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Reported successfully');
      return data;
    } else {
      throw new Error(data.message || 'Report failed');
    }

  } catch (error) {
    console.error('Report result error:', error.message);
    return null;
  }
}


async function displayAccountInfo() {
  try {
    console.log('\n=== Account information ===');
    
    const proxyAgent = await getProxyAgent();
    const profileResponse = await fetch(`${config.baseUrl}/v1/api/auth/profile`, {
      headers: getCommonHeaders(),
      agent: proxyAgent,
      timeout: 30000
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log(`username: ${profile.data.username || 'not set'}`);
      console.log(`Mail: ${profile.data.email || 'not set'}`);
    }
    
    console.log('=== ======== ===\n');
  } catch (error) {
    console.error('Failed to obtain account information:', error.message);
  }
}


async function main() {
  try {
    console.log('\n=== Start speed test ===');
    console.log('time:', new Date().toLocaleString());
    
    await validateToken();
    console.log('Token verify: ✅ efficient');
    
    await displayAccountInfo();
    
    config.location = generateRandomLocation();
    console.log(`Speed measurement location: Latitude ${config.location.latitude}, longitude ${config.location.longitude}`);
    
    console.log('\nStart executing speed test...');
    const { downloadSpeed, uploadSpeed } = await performSpeedTest();
    console.log('\nSpeed test results:');
    console.log(`- Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
    console.log(`- Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
    
    console.log('\nReporting results...');
    const result = await reportResults(downloadSpeed, uploadSpeed);
    
    if (result && result.success) {
      console.log('\nResult reporting: ✅ success');
      await displayAccountInfo();
    } else {
      console.log('\nResult reporting: ❌ fail');
      if (result && result.message) {
        console.log('Reason for failure:', result.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ mistake:', error.message);
    if (error.response) {
      try {
        const errorData = await error.response.json();
        console.error('The server returns:', errorData);
      } catch {
        console.error('Status code:', error.response.status);
      }
    }
  } finally {
    const nextTime = new Date(Date.now() + config.checkInterval);
    console.log(`\nNext speed test time: ${nextTime.toLocaleString()}`);
    console.log('Interval time:', Math.round(config.checkInterval / 1000 / 60), 'minute');
    console.log('=== Speed test ends ===\n');
    setTimeout(main, config.checkInterval);
  }
}


process.on('SIGINT', () => {
  console.log('\nExit signal received');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTermination signal received');
  process.exit(0);
});


console.clear();
console.log(banner);
console.log('Starting...');
initConfig().then(() => {
  main();
});
