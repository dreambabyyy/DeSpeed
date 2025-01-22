# DeSpeed ​​SpeedTest - Single Account

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![banner](DeSpeed-DePin.jpg)

## 📖 Introduction

This is a simple and easy-to-use DeSpeed ​​speed test script, mainly used for automated speed testing and points acquisition. It supports running on Windows local and Linux VPS. Even if you are a programming novice, you can easily use it by following the steps below!

## ✨ Features

- 📊 Fully automatic speed measurement and reporting
- ⏰ Customizable speed measurement interval (recommended more than 30 minutes)
- 🔒 Support proxy (HTTP/SOCKS)
- 🌍 Automatic random location
- 💪 Stable and reliable, small memory usage
- 🖥️ Support Windows/Linux systems

## 🚀 Quick start

## Windows local operation

### 1️⃣ Install necessary software

1. **Install Node.js**
- Visit [Node.js official website](https://nodejs.org/)
- Download and install the "LTS" version (Long Term Support Version)
- All default options are OK during installation
- After the installation is complete, press `Win + R`, enter `cmd`, and enter the following command to check:
```bash
node --version # Should display v18.x.x or higher
npm --version # Should display 8.x.x or higher
```

2. **Download this script**
- Click the green "Code" button in the upper right corner of this page
- Select "Download ZIP"
- Unzip the downloaded file to any directory (for example: D:\DeSpeed-DePin)

### 2️⃣ Install dependencies

1. Open the command prompt (CMD):
- Press `Win + R`
- Type `cmd` and press Enter

2. Enter the script directory:
```bash
# Assuming you unzipped to D:\DeSpeed-DePin
cd /d D:\DeSpeed-DePin
```

3. Install the required packages:
```bash
npm install node-fetch@2 https-proxy-agent socks-proxy-agent ws
```

### 3️⃣ Get DeSpeed ​​token

1. **Register an account**
- Visit [DeSpeed ​​official website](https://app.despeed.net/register?ref=dCmVwI7EwiuE)
- Complete registration and log in

2. **Get a token** (simple method)
- Press F12 to open the developer tools
- Click "Application"
- Find "Local Storage" → "https://app.despeed.net" on the left
- Find "token" and copy its value

### 4️⃣ Run the script

1. Run in the command prompt:
```bash
node start.js
```

2. Enter as prompted:
- Paste your token
- Whether to use a proxy (y/n)
- If using a proxy, enter the proxy information
- Set the check interval (recommended to be more than 30 minutes)

## 🌟 Usage suggestions

1. **Speed ​​test interval**
- It is recommended to set it to 30 minutes or longer
- Too frequent may cause account risks

2. **Proxy settings**
- Use a stable proxy server
- Proxy format: `IP: port: username: password`
- For example: `1.2.3.4:8080:user:pass`

3. **Long-term operation**
- Windows users are recommended to run with administrator privileges
- The window can be minimized, but do not close it
- If you need to run in the background, you can use PM2 (advanced users)

## 🖥️ Linux VPS Run the tutorial

### 1️⃣ Preparation

1. **VPS requirements**
- Memory: 512MB or more
- System: Ubuntu/Debian/CentOS
- Architecture: Support x86_64 and ARM
- Bandwidth: 1Mbps or more is recommended

2. **Connect to VPS**
- Windows users are recommended to use [Xshell](https://www.netsarang.com/xshell/) or [PuTTY](https://putty.org/)
- Mac/Linux users can directly use the terminal: `ssh root@your server IP`

### 2️⃣ Install Node.js

1. **Ubuntu/Debian system**:
```bash
# Add Node.js official source
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt update
sudo apt install -y nodejs

# Verify installation
node --version # Should display v18.x.x
npm --version # Should display 8.x.x or higher
```

2. **CentOS/RHEL system**:
```bash
# Add Node.js official source
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 3️⃣ Download and configure scripts

1. **Install Git and clone the project**:
```bash
# Ubuntu/Debian
sudo apt install -y git

# CentOS
sudo yum install -y git

# Clone the project
git clone https://github.com/questairdrop/DeSpeed-DePin.git
cd DeSpeed-DePin
```

2. **Install dependencies**:
```bash
# Method 1: Direct installation (recommended)
npm install

# Method 2: Use a domestic mirror (if the installation is too slow)
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install

# Method 3: Manually install core dependencies
npm install node-fetch@2 https-proxy-agent socks-proxy-agent ws
```

### 4️⃣ Run with Screen

1. **Install Screen**:
```bash
# Ubuntu/Debian
sudo apt install -y screen

# CentOS
sudo yum install -y screen
```

2. **Create a new session**:
```bash
# Create a new screen session
screen -S DeSpeed-DePin

# If prompted, press Enter to continue
```

3. **Run the script**:
```bash
# Make sure you are in the despeed directory
cd ~/DeSpeed-DePin
node start.js
```

4. **Run in the background**:
- Press `Ctrl + A`, then `D` to put the program in the background
- Use `screen -ls` to view all sessions
- Use `screen -r DeSpeed-DePin` to reconnect to the session
- Use `screen -X -S DeSpeed-DePin quit` to end the session

### 5️⃣ Run with PM2 (recommended)

1. **Install PM2**:
```bash
# Install PM2 globally
npm install -g pm2
```

2. **Startup script**:
```bash
# Start the program
pm2 start start.js --name despeed

# Other common commands
pm2 list # View running status
pm2 logs DeSpeed-DePin # View logs
pm2 stop DeSpeed-DePin # Stop the program
pm2 restart DeSpeed-DePin # Restart the program
pm2 delete DeSpeed-DePin # Delete the program

# Set to start automatically at boot
pm2 save
pm2 startup
```

## 📝 VPS usage suggestions

1. **System configuration**
- Ubuntu 20.04/22.04 LTS is recommended
- Ensure the system time is correct: `timedatectl set-timezone Asia/Shanghai`
- It is recommended to enable the firewall:
```bash
# Ubuntu/Debian
sudo ufw allow ssh
sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

2. **Proxy settings**
- Use a stable proxy server
- It is recommended to use HTTP proxy (more stable)
- Check proxy availability regularly
- Proxy format example:
```
HTTP proxy: 1.2.3.4:8080:user:pass
SOCKS proxy: 5.6.7.8:1080:user:pass
```

3. **Performance optimization**
- Speed ​​test interval recommendation 30-60 minutes
- Memory usage monitoring: `free -h`
- Process monitoring: `top` or `htop`
- If memory is insufficient, you can add swap space:
```bash
# Create 2GB swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

4. **Log management**
- View logs when using PM2: `pm2 logs DeSpeed-DePin`
- Save logs to files: `node start.js > DeSpeed-DePin.log 2>&1`
- Clean logs regularly: `echo "" > DeSpeed-DePin.log`

5. **Security recommendations**
- Modify the default SSH port
- Disable password login and use key login
- Install and configure fail2ban
- Update the system regularly:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

## 🔍 VPS FAQ

### 1. Connection issues
- **Unable to connect to VPS**
- Check if the IP address is correct
- Check if the SSH port is correct
- Check firewall settings

- **SSH connection is unstable**
```bash
# Edit SSH configuration
vim ~/.ssh/config

# Add the following content
Host *
ServerAliveInterval 30
ServerAliveCountMax 3
```

### 2. Performance issues
- **Memory usage is too high**
- Use `free -h` to check memory
- Consider increasing swap space
- Increase speed test interval appropriately

- **CPU usage is too high**
- Use `top` to view processes
- Check if there are other programs occupying
- Reduce the number of concurrent connections appropriately

### 3. Network issues
- **Speed ​​test failed**
- Check server bandwidth
- Verify proxy availability
- Check firewall settings

- **Proxy connection failed**
```bash
# Test proxy connection
curl -x http://user:pass@ip:port https://api.ipify.org

# Or use SOCKS proxy
curl --socks5 user:pass@ip:port https://api.ipify.org
```

## 📞 Get help

1. **View error log**
```bash
# PM2 log
pm2 logs DeSpeed-DePin

# Run log directly
tail -f DeSpeed-DePin.log
```

2. **Collect system information**
```bash
# System information
uname -a

# Memory usage
free -h

# Disk usage
df -h
```

3. **Contact the author**
- Telegram: ([https://t.me/superbianz])

## ⚠️ Disclaimer

This program is only for learning and communication. Any consequences of using this program are borne by the user. Please use it reasonably and avoid abuse.

## 📝 License

[MIT](LICENSE) 
