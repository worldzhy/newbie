<p align="left">

## newbie init

#### newbie command

1. choose and active/unactive newbie services
   npm run newbie config
2. see all provided services
   npm run newbie ls
3. see all used services
   npm run newbie use
4. add services
   npm run newbie add <name,name,name>
5. remove services
   npm run newbie remove <name,name,name>

#### .newbie.json file example

```
{
  "services": [
    "account",
    "cloud",
    "cron",
    "event-scheduling",
    "map",
    "notification",
    "order-mgmt",
    "prople-finder",
    "shortcut",
    "stock-mgmt",
    "storage",
    "tag",
    "workflow"
  ]
}
```

## License

Newbie is [MIT licensed](LICENSE).
