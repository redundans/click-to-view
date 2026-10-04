# Click to View

![License](https://img.shields.io/badge/license-MIT-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/redundans/click-to-view.svg)](https://packagist.org/packages/redundans/click-to-view) [![Total Downloads](https://img.shields.io/packagist/dt/redundans/click-to-view.svg)](https://packagist.org/packages/redundans/click-to-view)

A [Flarum](https://flarum.org) extension. Renders a GDPR-message instead of embedding media contents.

## How it works

Flarum core (via [s9e/TextFormatter](https://github.com/s9e/TextFormatter)'s MediaEmbed plugin) renders oembeds —
e.g. YouTube, Vimeo, Twitter/X — as `<iframe>`s directly in post content. Without intervention, the browser loads
these iframes (and any cookies/tracking the provider sets) as soon as a post is displayed, regardless of consent.

This extension rewrites post content before it is inserted into the page, replacing each embed with an inert
"click to view" banner. The embed's `src` is only restored — and the actual request to the provider made — once a
visitor clicks the banner. That choice is then remembered per provider (e.g. YouTube) in the browser's
`localStorage`, so visitors aren't asked again for embeds from a provider they've already approved, while
providers they haven't interacted with still require a separate click.

## Installation

Install with composer:

```sh
composer require redundans/click-to-view:"*"
```

## Updating

```sh
composer update redundans/click-to-view:"*"
php flarum migrate
php flarum cache:clear
```

## Links

- [Packagist](https://packagist.org/packages/redundans/click-to-view)
- [GitHub](https://github.com/redundans/click-to-view)
- [Discuss](https://discuss.flarum.org/d/PUT_DISCUSS_SLUG_HERE)
