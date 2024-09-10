const fs = require('fs');
const path = require('path');
const dns = require('dns');
const whois = require('whois');
const { promisify } = require('util');

// Read and parse the config.json file
const configPath = path.resolve(__dirname, 'config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Failed to load or parse config.json:', error.message);
  process.exit(1);
}

// Use values from config.json
const keyword = config.keyword || ""; // Default to empty string if not provided
const fromLeft = config.fromLeft || true; // Default to true if not provided
const DOMAIN_LENGTH = config.domainLength || 4; // Default to 4 if not provided

const resolveDomain = promisify(dns.resolveAny);
const lookup = promisify(whois.lookup);

// Generate domain names of a specified length with optional keyword
const generateDomains = (length, keyword, fromLeft) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const domains = [];

  if (keyword) {
    if (fromLeft) {
      // Append random characters after keyword
      const suffixLength = length - keyword.length;
      const generateWithSuffix = (prefix, length) => {
        if (length === 0) {
          domains.push(prefix);
          return;
        }
        for (let i = 0; i < chars.length; i++) {
          generateWithSuffix(prefix + chars[i], length - 1);
        }
      };
      generateWithSuffix(keyword, suffixLength);
    } else {
      // Prepend random characters before keyword
      const prefixLength = length - keyword.length;
      const generateWithPrefix = (prefix, length) => {
        if (length === 0) {
          domains.push(prefix + keyword);
          return;
        }
        for (let i = 0; i < chars.length; i++) {
          generateWithPrefix(prefix + chars[i], length - 1);
        }
      };
      generateWithPrefix("", prefixLength);
    }
  } else {
    // Generate random domains
    const generateRandom = (prefix, length) => {
      if (length === 0) {
        domains.push(prefix);
        return;
      }
      for (let i = 0; i < chars.length; i++) {
        generateRandom(prefix + chars[i], length - 1);
      }
    };
    generateRandom("", length);
  }

  return domains;
};

// Check domain availability using WHOIS
const checkDomainAvailabilityWithWhois = async (domain) => {
  try {
    const result = await lookup(domain);
    if (
      result.includes("No match for") ||
      result.includes("NOT FOUND") ||
      result.includes("Domain not found")
    ) {
      return "Available";
    } else {
      return "Taken";
    }
  } catch (error) {
    console.error(`WHOIS lookup failed for ${domain}:`, error.message);
    return "Unknown";
  }
};

// Check domain availability using DNS as a backup
const checkDomainAvailabilityWithDns = async (domain) => {
  try {
    await resolveDomain(domain);
    return "Taken";
  } catch (error) {
    if (error.code === "ENODATA" || error.code === "ENOTFOUND") {
      return "Available";
    }
    return "Unknown";
  }
};

// Check domain availability using both WHOIS and DNS
const checkDomainAvailability = async (domain) => {
  let status = await checkDomainAvailabilityWithWhois(domain);

  if (status === "Unknown") {
    console.log(
      `WHOIS check failed for ${domain}. Using DNS lookup as a backup...`
    );
    status = await checkDomainAvailabilityWithDns(domain);
  }

  return status;
};

// Append available domains to file
const appendToFile = (filePath, domain) => {
  fs.appendFile(filePath, `${domain}.com\n`, (err) => {
    if (err) {
      console.error("Failed to write to file:", err.message);
    }
  });
};

// Shuffle array function
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Main function
const main = async () => {
  const length = DOMAIN_LENGTH;
  if (length <= 0) {
    console.error("Please provide a valid number of letters.");
    return;
  }

  const domains = generateDomains(length, keyword, fromLeft);
  shuffleArray(domains); // Shuffle domains to start search from a random place

  console.log(`Checking availability for ${domains.length} domains...`);

  const filePath = path.resolve(__dirname, "domains.txt");

  for (const domain of domains) {
    const status = await checkDomainAvailability(`${domain}.com`);
    if (status === "Available") {
      console.log(`${domain}.com: ${status}`);
      appendToFile(filePath, domain);
    } else if (status === "Unknown") {
      console.log(`Could not determine availability for ${domain}.com`);
    }
  }
};

main();
