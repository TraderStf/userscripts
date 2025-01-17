# Userscripts Safari

An open-source userscript editor for Safari.

![Userscripts Safari](/etc/screenshot.png)

## Table of Contents
* [Installation](#installation)
* [Getting Help](#getting-help)
* [UI Overview](#ui-overview)
    * [Browser Page](#browser-page)
    * [Settings Modal](#settings-modal)
    * [Popover](#popover)
* [Metadata](#metadata)
* [Save Location](#save-location)
* [FAQs](#faqs)
* [Contributing](#contributing)
* [Support](#support)
* [Privacy Policy](#privacy-policy)
* [License](#license)

## Installation

Install via [Mac App Store](https://itunes.apple.com/us/app/userscripts/id1463298887) or clone the project and build with Xcode. Alternatively, you can download the most current version for the [releases page](https://github.com/quoid/userscripts/releases).

## Getting Help

If you encounter a problem or need some assistance, please open an issue and *provide some system specs*. The specs requested are `macOS version`, `Safari version` and `Userscripts Safari version`. You can find the extension version by opening the contain app or by viewing the "Information" section within the settings modal of the extension's browser page.

If you encounter an issue with a specific website, *please provide the website address and the userscript that is presenting the issue*. It can be a slimmed down version of the userscript that can demonstrate the issue.

## UI Overview

### Browser Page:

![Userscripts Safari Main Application Window](/etc/ui01.png)

1. **Extension button** - click this button to open the extension interface
1. **Filter bar** - use this input to filter items in the sidebar, by *name*
1. **Sort button** - changes the order of the items in the sidebar by name or modified time
1. **Sidebar buttons** - *described left to right*
    - The `settings` button (represented by a [cog](https://wikipedia.org/wiki/Gear)) displays the settings modal (discussed below)
    - The `plus` button allows users to add new items
        - `New CSS` is a "userscript" that expects [CSS](https://www.w3schools.com/css/) code
        - `New Javascript` is a prototypical userscript that expects [Javascript](https://www.w3schools.com/js/DEFAULT.asp) code
        - `New Remote` allows the user to add a remote hosted userscript (or style) by inputting the web address (*ex:* `https://www.k21p.com/example.user.js`)
1. **Item toggle** - this toggle enables or disables an item
1. **Item** - this is the userscript (or style), clicking on it will load it's contents into the editor - *you can hide descriptions in the settings area!*
1. **Editor buttons (top)** - *described left to right*
    - **Update button** - this button allows you to update userscripts that meet the following conditions
        - metadata contains `@version` tag
        - metadata contains `@updateURL` tag
    - **Download button** - click this button to download a copy of your userscript
        - *Note:* every userscript that is displayed in the interface is already present on your local machine, at your save location - the download button offers a quick way to retrieve a copy of that file, without needing to click the settings button, and then the save location link within the settings modal
    - **Trash button** - moves the currently loaded userscript to the trash bin - it will subsequently be removed from the interface and save location
1. **Editor buttons (bottom)**
    - `Discard` - while editing, reverts any unsaved changes you've made to a userscript
    - `Save` - while editing, saves all changes you've made to a userscript
        - `Command + S` is the keyboard shortcut for the action

### Settings Modal:

![Userscripts Safari Settings Window](/etc/settings.png)

- **Auto Close Brackets** - toggles on/off auto closing of brackets in the editor
    - this affects the following characters: `() [] {} "" ''`
- **Auto Hint** - automatically shows completion hints while editing
- **Hide Descriptions** - hides the item descriptions in the sidebar
- **Show Invisibles** - toggles the display of invisible characters in the editor
- **Javascript Linter** - toggles basic Javascript linting within the editor
- **Tab Size** - the number of spaces a tab is equal to while editing, obviously defaults to `4` because using `2` spaces is absolute insanity
- **Enable Injection** - toggle on/off script injection for the pages you visit (this is the on/off switch)
- **Show Toolbar Count** - displays a badge on the toolbar icon with a number that represents how many enabled scripts match the url for the page you are on
- **Save Location** - where your file are currently located and being saved to (click the blue text to open location)
- **Change Save Location (cogs icon)** - this button, located directly to the right of the save location, is a shortcut for opening the host app, which will allow you to change the save location
- **Global Blacklist** - all domain patterns listed here will be *globally* ignored for script injection

### Popover:

![Userscripts Safari Settings Window](/etc/popover.png)

10. **Open button** - opens the extension browser page
11. **Enable Injection toggle** - turns on/off page script inject (on/off switch)

## Metadata

Userscripts Safari currently supports the following userscript metadata:

- `@name` - This will be the name that displays in the sidebar and be used as the filename - you can *not* use the same name for multiple files of the same type
- `@description`- Use this to describe what your userscript does - this will be displayed in the sidebar - there is a setting to hide descriptions
- `@match` - Domain match patterns - you can use several instances of this field if you'd like multiple domain matches - view [this article for more information on constructing patterns](https://developer.chrome.com/extensions/match_patterns)
- `@exclude-match` - Domain patterns where you do *not* want the script to run
- `@include` - An alias for `@match` - functions exactly like `@match`
- `@exclude` - An alias for `@exclude-match` - functions exactly like `@exclude-match`
- `@inject-into` - allows the user to choose which context to inject the script into
    - allows the user to choose which context to inject the script into
    - values: auto (default), content, page
    - works like [violentmonkey](https://violentmonkey.github.io/api/metadata-block/#inject-into)
- `@run-at`
    - allows the user to choose the injection timing
    - document-start, document-end (default), document-idle
    - works like [violentmonkey](https://violentmonkey.github.io/api/metadata-block/#run-at)
    - **JS Only**
- `@weight`
    - allows the user to further adjust script injection timing
    - can be used to ensure one script injects before another
    - ONLY accepts integers (floats, strings and everything else will be ignored)
    - min value = 1, max value = 999, higher numbers (“heavier”) execute earlier
- `@require`
    - allows users to include remote resources in their scripts
    - the value must be a valid url, currently no local file support
    - must require a resource of the same file type (js for js, css for css)
    - when a resource is required, it is downloaded and saved locally
    - the resources is downloaded once at save and never checked for updates or parsed in anyway
        - if you want to update the require resources, and the url does not change, you must remove the resources, save, then re-input it
    - **require remote resources at your own risk, the extension never validates remote resource code in any way and be aware that using remote resources from untrusted sources can jeopardize your personal security**
- `@version`
    - used to determine the current version of a userscript
    - when paired with `@updateURL`, this will allow the user to update a userscript from a remote source, if the version on their machine is `<` version at the update URL
    - `@version` does nothing by itself, it needs to be paired with` @updateURL` for remote updating to function properly
- `@updateURL`
    - the remote url to check version against
    - if the version of the file located at the update URL is `>` the version on the local machine, the file will be updated
    - `@updateURL` does nothing by itself, it needs to be paired with `@version` for remote updating to function properly
- `@downloadURL`
    - optional download location for a remotely updateable file (*i.e. a file that has both `@version` and `@updateURL`)
    - when paired with `@version` and `@updateURL`, if the local version is `<` the version of the file that `@updateURL` points to, the extension will attempt to update the file's code with the contents of the file located at the `@downloadURL`
    - `@downloadURL` does nothing by itself, it needs `@version` and `@updateURL` to present in order to function properly
- `@noframes`
    - this key takes no value
    - prevents code from being injected into nested frames
    
**All userscripts need at least 1 `@match` or `@include` to run!**

## Save Location

In order to change the save location, you must either launch `Userscripts.app` as you would any other application, or open the settings modal within the browser extension and click the "settings" icon within the "Save location" row.

Once the host app is open, you will see a button called "Change save location". Click this and select the directory where you'd like to save to/load from.

**Save Location Notes**

- Close all instances of the extension UI (browser app) before you change the save location. The extension will attempt to do this automatically, but it could fail (if it does, please bug report)
- Currently, when changing the save location, the app does not copy over userscripts from the previous save/load directory
- After a new save location is selected, if you rename or move that selected folder, the extension will continue to load/save to that location - the only way to remove the “link” is by trashing the folder or selecting a new save location

## FAQs

**Do I need to use the extension's editor to create new userscripts or to edit existing?**

> You can use your own editor to update and manage your files. As long as you are saving the files to the save location, and they are porperly formatted, they should be injected. However, you **must open the extension page** beforehand. That means, if you create a new userscript and save it to the save location, before injection will occur properly, the extension page must be open (by clicking the extension button in Safari.

**What are the the keyboard shortcuts?**

> While editing a file, clicking `Command + S` will save the file. While working the editor, clicking `Command + F` will bring up the search bar.

**When I use `@require`, where are the required files stored?**

> All required files are saved *as Javascript files* in the extension container folder in macOS 11.x. That folder is located in the default save location, at: `~/Library/Containers/Userscripts/Data/Documents/require/`.
>
> If you move files from the require folder or manually edit the `manifest.json` file, you will likely break app/extension functionality.

## Contributing
Code level contributions are welcome. I prefer to collaborate directly with contributors rather than receiving spontaneous pull requests. If you feel you can improve the project in some way, please reach out to me by email or by opening an issue with your improvement/feature request.

Further, any issue marked "help wanted" is actively seeking assistance. Please respond to those issues with feedback, guidance or offers of coding assistance.

Please ensure your contributions align with the project's license before committing anything.

## Support
The quickest and easiest way to support the project is by [leaving a positive review on the App Store](https://apps.apple.com/us/app/userscripts/id1463298887) if you enjoy the extension and want to see it improve in the future. Seeing these reviews let me know I am doing something right, or wrong, and motivates me to continue working on the project.

Secondly, you can [sign up to be a beta tester](https://forms.gle/QB46uYQHVyCxULue9). Since this extension values your privacy, and **does not collect any data from users**, it is difficult to gauge how the extension is being used. By signing up to be a beta tester it not only allows you to test upcoming features, but also gives me the opportunity to elicit direct feedback from real users.

## Privacy Policy
Userscripts does not collect any data from its users nor monitor activities or actions you perform within the application and extension. This means everything that you do with the application and extension is private to you and is never shared with the developers or third parties. Since there is no data collection, there is no data retention of any kind.

## License

Licensed under the [GNU General Public License v3.0](/LICENSE) license for all open source applications. A commercial license is required for all other applications.
