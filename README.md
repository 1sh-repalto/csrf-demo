# csrf-demo

A demo website showcasing Cross-Site Request Forgery (CSRF) attack mechanisms.

## Key Features & Benefits

*   Demonstrates a vulnerable website susceptible to CSRF attacks.
*   Provides an attacker site to simulate a malicious actor.
*   Illustrates the underlying principles and potential impact of CSRF.
*   Helps developers understand and mitigate CSRF vulnerabilities in web applications.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Node.js:** (Version >= 18 recommended).  You can download it from [nodejs.org](https://nodejs.org/).
*   **npm:** (Usually comes with Node.js).
*   A modern web browser (Chrome, Firefox, Safari, etc.)

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/1sh-repalto/csrf-demo.git
    cd csrf-demo
    ```

2.  **Install dependencies for the vulnerable site:**

    ```bash
    cd vulnerable_site/server
    npm install
    cd ../../
    ```

3.  **(Optional) Install dependencies for the attacker site:**
    (Note: The attacker site may not require dependencies install, depends on the attacker implementation.)

    ```bash
    cd attacker_site/
    # If applicable, run npm install, yarn install, or pnpm install
    # npm install
    cd ../
    ```

4.  **Start the vulnerable server:**

    ```bash
    cd vulnerable_site/server
    npm start
    cd ../../
    ```

    The vulnerable site should now be running, typically on `http://localhost:3000` (or a similar port; check the server output).

5.  **(Optional) Start the attacker server:**

    The way to start the attacker server depends on how it is implemented. In general, open the attacker_site/ folder on the browser directly.
    (The attacker site may not require a server depends on the attacker implementation.)

## Usage Examples

1.  **Access the vulnerable website:**

    Open your web browser and navigate to the address where the vulnerable site is running (e.g., `http://localhost:3000`).

2.  **Simulate a CSRF attack:**

    *   Open the attacker site in a separate browser tab/window.
    *   Follow the instructions on the attacker site to initiate the CSRF attack.
    *   Observe the behavior on the vulnerable website to see the impact of the attack.

## Project Structure

```
csrf-demo/
├── attacker_site/        # Contains the code for the attacker's website.
│   └── ...
├── vulnerable_site/    # Contains the code for the vulnerable website.
│   └── server/           # Backend server for the vulnerable website
│       ├── node_modules/  # Node.js dependencies.
│       ├── .package-lock.json # Npm lock file
│       ├── index.js       # Entry point for server
│       ├── package.json    # Server dependencies
│       └── ...
├── node_modules/          # Top-level node dependencies (optional, depends on usage)
├── .package-lock.json
├── accepts/
│   ├── HISTORY.md
│   ├── LICENSE
│   ├── README.md
│   ├── index.js
│   ├── package.json
│   └── body-parser/
│       ├── HISTORY.md
│       ├── LICENSE
│       ├── README.md
│       ├── index.js
│       └── lib/
│           ├── read.js
│           └── types/
│               ├── json.js
└── README.md             # This file.
```

## Configuration Options

The server can be configured via environment variables, if needed. Refer to the server's code (`vulnerable_site/server/index.js` or similar) for available configuration options.  Examples:

*   `PORT`:  The port the server listens on (default: 3000).

## Contributing Guidelines

Contributions are welcome! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

## License Information

This project does not currently have a specified license. All rights are reserved by the owner.

## Acknowledgments

This project utilizes the following open-source libraries:

*   **accepts:** Higher-level content negotiation. See [accepts](https://www.npmjs.com/package/accepts).
*   **body-parser:** Node.js body parsing middleware. See [body-parser](https://www.npmjs.com/package/body-parser).
