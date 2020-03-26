# Corona Virus Monitor

This is a corona virus monitor that fetches data from this [API](http://www.dropwizard.io/1.0.2/docs/), details can be found [here](https://github.com/NovelCOVID/API), it then sends updates to a Discord webhook.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
got (Requests)
lodash (Utility Functions)
moment (Date Parsing)
@harvey1717/logger (Terminal Logger)
```

### Installing

This project uses pnpm as it's package manager. You can read about it's benefits and install [here](https://pnpm.js.org/).

Install pnpm

```
curl -L https://raw.githubusercontent.com/pnpm/self-installer/master/install.js | node
```

Install required packages using pnpm

```
pnpm install
```

## Running

```
node index.js
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
