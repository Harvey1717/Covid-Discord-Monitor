# Corona Virus Monitor

This is a corona virus monitor that fetches data from this [API](https://corona.lmao.ninja), details can be found [here](https://github.com/NovelCOVID/API), it then sends updates to a Discord webhook.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

```
got (Requests)
lodash (Utility Functions)
moment (Date Parsing)
@harvey1717/logger (Terminal Logger)
```

### Installing

> This project uses pnpm as it's package manager. You can read about the install and it's benefits [here](https://pnpm.js.org/).

Install pnpm

```
curl -L https://raw.githubusercontent.com/pnpm/self-installer/master/install.js | node
```

Install required packages using pnpm

```
pnpm install
```

## Setup

Rename `config-example.json` to `config.json`.

Fill in the required fields.

---

- You can find a guide to Discord Webhooks [here](https://google.com).
- The `apiURL` needs to be a valid endpoint from the `https://corona.lmao.ninja` API.

## Running

```
node index.js
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
