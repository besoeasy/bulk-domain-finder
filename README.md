# Bulk Domain Finder

Bulk Domain Finder is a Node.js application that helps you generate and check the availability of domain names. It can create domain names based on a specified length and keyword, and it can check if these domains are available for registration.

## Features

- Generate domain names of a specified length with optional keywords.
- Check domain availability using WHOIS and DNS lookups.
- Save available domains to a file (`domains.txt`).

## Requirements

- Node.js (v12 or higher)
- `config.json` for configuration

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/bulk-domain-finder.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd bulk-domain-finder
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

## Configuration

Create a `config.json` file in the root directory of the project with the following structure:

```json
{
  "keyword": "example",
  "fromLeft": true,
  "domainLength": 7
}
```

- `keyword` (string): The keyword to include in the domain names.
- `fromLeft` (boolean): If `true`, the keyword is appended to random characters. If `false`, the keyword is prepended.
- `domainLength` (number): The total length of the domain name excluding the `.com` extension.

**Note:** If `config.json` is not provided or invalid, the script will use default values: an empty keyword, keyword appended to the right, and a domain length of 4 characters.

## Usage

1. **Run the script:**

   ```bash
   npm start
   ```

   The script will generate domain names based on your configuration, check their availability, and append available domains to `domains.txt`.

2. **Check `domains.txt`** for a list of available domains.

## How It Works

1. **Generate Domains:**
   The script generates domain names of the specified length, incorporating the keyword as configured.

2. **Check Availability:**
   It uses both WHOIS and DNS lookups to determine if a domain is available. WHOIS is tried first, and DNS is used as a backup if WHOIS fails.

3. **Save Results:**
   Available domains are saved to `domains.txt`.

## Error Handling

- If `config.json` fails to load or parse, the script will exit with an error message.
- If domain availability checks fail or encounter issues, the script will log appropriate messages.


## Contributing

If you have suggestions or improvements, please feel free to open an issue or submit a pull request. Contributions are welcome!

---

Happy domain hunting! 🚀
