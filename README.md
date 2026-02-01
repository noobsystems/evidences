# Evidences

Evidences is an advanced FiveM script adding evidences like blood, fingerprints and magazines to your server.

<p align="center">
    <img width="13.5%" src="https://github.com/user-attachments/assets/8d839f26-9cca-41cf-b237-b6f09b7f553d" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/9e0f38b4-b58d-4ba7-ba05-08d2999791d9" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/24b93e12-d67d-42e4-849a-b3d18aac3198" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/2ef205d8-a41e-41f5-9e19-7e4ed9eed453" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/61efcbec-45f5-4a4f-8a78-fbbee5e26148" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/8f861c93-3b14-4636-98fb-4209db9b48ea" />
    <img width="13.5%" src="https://github.com/user-attachments/assets/756c7a66-28a9-4262-9195-b6e24fcda11d" />
</p>

This item-based script provides law enforcement authorities with all the information they need to reconstruct the sequence of events of a crime, identify the perpetrators, and prove their guilt later on. If the criminals acted without caution, fingerprints and DNA traces can be secured at the crime scene and compared with database records of previous offenders by using the evidence laptop. In addition, dropped magazines provide information about the weapon used at the crime scene. Now the laptop also has an app that can be used to wiretap phone calls, for example.

<p align="center">
    <img width="49%" height="auto" src="https://github.com/user-attachments/assets/816c6dcc-011f-48ec-9edd-c07369adb0aa" />
    <img width="49%" height="auto" src="https://github.com/user-attachments/assets/d4a1931a-584c-4a1d-a09e-69a0255c286d" />
</p>

> [!IMPORTANT]
> Check out the **[wiki](https://github.com/noobsystems/evidences/wiki)** to get a detailed view on this script's features and learn how to use it on your roleplay server!
> - Working with evidences
>     - [Fingerprints](https://github.com/noobsystems/evidences/wiki/Fingerprints)
>     - [Blood](https://github.com/noobsystems/evidences/wiki/Blood)
>     - [Weapon magazines](https://github.com/noobsystems/evidences/wiki/Weapon-magazines)
> - [Evidence Laptops](https://github.com/noobsystems/evidences/wiki/Evidence-Laptops)
>     - [Database App](https://github.com/noobsystems/evidences/wiki/Database-App)
>     - [Wiretap App](https://github.com/noobsystems/evidences/wiki/Wiretap-App)
> - [Evidence Boxes](https://github.com/noobsystems/evidences/wiki/Evidence-Boxes)
> - [Implementing other frameworks](https://github.com/noobsystems/evidences/wiki/Implementing-other-frameworks)
> - [Using the built‐in API](https://github.com/noobsystems/evidences/wiki/Using-the-built%E2%80%90in-API)

> [!WARNING]
> The script isn't working? Check your server's live-console for related errors. These will tell you if dependencies are missing or if other setup steps aren't completed. You receive support and can share your ideas at GitHub's Discussions.
>
> [![](https://img.shields.io/badge/CLICK_TO_ASK_FOR_HELP-orange?style=for-the-badge)](https://github.com/noobsystems/evidences/discussions/new?category=support)


## Installation
1. Make sure you have the scripts [ox_lib](https://github.com/CommunityOx/ox_lib), [oxmysql](https://github.com/CommunityOx/oxmysql), [ox_inventory](https://github.com/CommunityOx/ox_inventory), [ox_target](https://github.com/CommunityOx/ox_target) and one of the frameworks [<img src="https://avatars.githubusercontent.com/u/30593074?s=200&v=4" alt="ESX Legacy" width="16" height="16">](https://github.com/esx-framework/esx_core/tree/main/%5Bcore%5D/es_extended "ESX Legacy") [<img src="https://avatars.githubusercontent.com/u/111389699?s=200&v=4" alt="ND Framework" width="16" height="16">](https://github.com/ND-Framework/ND_Core "ND Framework") [<img src="https://avatars.githubusercontent.com/u/209772401?s=200&v=4" alt="Community Ox" width="16" height="16">](https://github.com/CommunityOx/ox_core "Community Ox") [<img src="https://avatars.githubusercontent.com/u/114441052?s=200&v=4" alt="Qbox Project" width="16" height="16">](https://github.com/Qbox-project/qbx_core "Qbox Project") installed on your server [(or implemented your custom one)](https://github.com/noobsystems/evidences/wiki/Implementing-other-frameworks). Make sure that these scripts are started before the evidence script.\
    <sub>We recommand using our <a href="https://github.com/noobsystems/ox_target">ox_target fork</a></b> that improves targetting of vehicle doors.</sub>\
    <sub>This script uses the [locale module of ox_lib](https://coxdocs.dev/ox_lib/Modules/Locale/Shared) for language selection and provides English, German and Czech translations by default. You change to selected language by setting the convar `setr ox:locale`. You can also add more languages or edit messages in a existing language file at <code>evidences/locales/</code>. Feel free to open a PR.</sub>

2. Create the required items by adding the file content from [🇬🇧](.github/setup/en_items.lua), [🇩🇪](.github/setup/de_items.lua), [🇪🇸](.github/setup/es_items.lua), [🇨🇿](.github/setup/cs_items.lua) or [🇹🇷](.github/setup/tr_items.lua) to `ox_inventory/data/items.lua`.
3. Make the [`evidence_box`](https://github.com/noobsystems/evidences/wiki/Evidence-Boxes) a container item if your ox_inventory's version is < 2.44.4 by pasting this code to `ox_inventory/modules/items/containers.lua`:
    ```lua
    setContainerProperties('evidence_box', {
        slots = 20,
        maxWeight = 5000
    })
    ```
4. Download the item images from [here](https://github.com/noobsystems/evidences/releases/latest/download/item_images.zip) and upload them to your `ox_inventory/web/images/` folder.\
    <sub>Credits for some of those images go to https://docs.rainmad.com/development-guide/finding-item-images. All other images were created by ChatGPT and Gemini, which, however, were edited by us afterwards to suit our preferences.</sub>
   
5. Finally, download the evidence-script, upload it into your server's resource folder and ensure it.

<p align="center" width="100%">
    <a href="https://github.com/noobsystems/evidences/releases/latest/download/evidences.zip">
        <img src="https://img.shields.io/badge/CLICK_TO_DOWNLOAD-rgb(231%2C18%2C77)?style=for-the-badge">
    </a>
</p>

https://github.com/user-attachments/assets/e678a118-3c96-449d-986a-8f4a443184de


## License
This project is licensed under the GNU General Public License v3.0 or later.
See the [LICENSE](LICENSE) file for the full text.  
Copyright &copy; 2025 noobsystems (https://github.com/noobsystems)
