# Evidences

Evidences is an advanced FiveM script adding evidences like blood, fingerprints and magazines to your server.

## Getting Started
1. Make sure you have the scripts [ox_lib](https://github.com/CommunityOx/ox_lib), [oxmysql](https://github.com/CommunityOx/oxmysql), [ox_inventory](https://github.com/CommunityOx/ox_inventory), [ox_target](https://github.com/CommunityOx/ox_target) and one of the frameworks [<img src="https://avatars.githubusercontent.com/u/30593074?s=200&v=4" alt="ESX Legacy" width="16" height="16">](https://github.com/esx-framework/esx_core/tree/main/%5Bcore%5D/es_extended "ESX Legacy") [<img src="https://avatars.githubusercontent.com/u/111389699?s=200&v=4" alt="ND Framework" width="16" height="16">](https://github.com/ND-Framework/ND_Core "ND Framework") [<img src="https://avatars.githubusercontent.com/u/209772401?s=200&v=4" alt="Community Ox" width="16" height="16">](https://github.com/CommunityOx/ox_core "Community Ox") [<img src="https://avatars.githubusercontent.com/u/114441052?s=200&v=4" alt="Qbox Project" width="16" height="16">](https://github.com/Qbox-project/qbx_core "Qbox Project") installed on your server [(or implemented your custom one)](https://github.com/noobsystems/evidences/blob/main/.github/setup/framework-implementation.md). Make sure that these scripts are started before the evidence script.\
    <sub>We recommand using our <a href="https://github.com/noobsystems/ox_target">ox_target fork</a></b> that improves targetting of vehicle doors.</sub>\
    <sub>This script uses the [locale module of ox_lib](https://coxdocs.dev/ox_lib/Modules/Locale/Shared) for language selection and provides English and German translations by default. You change to selected language by setting the convar `setr ox:locale`. You can also add more languages or edit messages in a existing language file at <code>evidences/locales/</code>. Feel free to open a PR.</sub>

2. Create the required items by adding the file content from [🇬🇧](.github/setup/en_items.lua), [🇩🇪](.github/setup/de_items.lua) or [🇨🇿](.github/setup/cs_items.lua) to `ox_inventory/data/items.lua`.
3. Make the [`evidence_box`](#evidence-box) a container item if your ox_inventory's version is < 2.44.4 by pasting this code to `ox_inventory/modules/items/containers.lua`:
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



> [!WARNING]
> The script isn't working? Check your server's live-console for related errors. These will tell you if dependencies are missing or if other setup steps aren't completed. You receive support and can share your ideas at GitHub's Discussions.
>
> [![](https://img.shields.io/badge/CLICK_TO_ASK_FOR_HELP-orange?style=for-the-badge)](https://github.com/noobsystems/evidences/discussions/new?category=support)


## How to use this script?

This item-based script provides law enforcement authorities with all the information they need to reconstruct the sequence of events of a crime, identify the perpetrators, and prove their guilt later on. If the criminals acted without caution, fingerprints and DNA traces can be secured at the crime scene and compared with database records of previous offenders. In addition, dropped magazines provide information about the weapon used at the crime scene.

Below, we show all scenarios in which evidence is created, how criminals can destroy it, and how the police can obtain relevant information from seized evidence using the [evidence laptop](#-evidence-laptop).


### 🫆 Fingerprints

<table width="100%">
    <tr>
        <td width="33%" valign="top">
            <img src="/.github/assets/fingerprint_at_vehicle_door.png" />
            Players leave fingerprints on <b>vehicle doors</b> when interacting with them or on the whole <b>vehicle</b> if it has no doors (e.g. boats and bikes).
        </td>
        <td width="33%" valign="top">
            <img src="/.github/assets/fingerprint_at_weapon.png" />
            Players leave fingerprints on <b>weapon items</b> when equipping them.
        </td>
        <td width="33%" valign="top">
            <img src="/.github/assets/fingerprint_at_scanner.png">
            One fingerprint at a time can be stored on a <b>fingerprint scanner</b>. This requires a police officer to use the <code>fingerprint_scanner</code> item and the fingerprinted player to target the scanner in the officer's hand.
        </td>
    </tr>
    <tr>
        <td colspan="3">
            By default, players don't leave fingerprints when wearing gloves. If you have custom clothing on your server, you need to add the ids of hands without gloves to the <code>exceptions</code>-list in <code>config.lua</code>:
<pre lang="lua">
16      config.isPedWearingGloves = function()
17          local handsVariation = GetPedDrawableVariation(cache.ped, 3)
18          local exceptions = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
                13, 14, 15, 112, 113, 114, 184, 196, 198}
19
20          return not lib.table.contains(exceptions, handsVariation)
21      end
</pre>
            Important: Fingerprints are <b><ins>only</ins></b> created if the function <b><ins>returns false</ins></b>! This means you have to ability to add further conditions, which have to be fulfilled in order for a player not to leave any fingerprints.
        </td>
    </tr>
    <tr>
        <td>
            If the fingerprint is not already present on an item (like a weapon), it must be transferred to a <code>fingerprint_taken</code> in order to continue <a href="#fingerprint-and-dna-app">working with it</a>.
            Therefore, the evidence has to be collected by targetting on it or its holder (this requires a <code>fingerprint_brush</code>) before it gets destroyed by another player using <code>hydrogen_peroxide</code>.
            <br>
            <p align="center">
                <img src="/.github/setup/images/fingerprint_taken.png">
                <img src="/.github/setup/images/fingerprint_brush.png">
                <img src="/.github/setup/images/hydrogen_peroxide.png">
            </p>
        </td>
    </tr>
</table>


### 🧬 DNA

<table width="100%">
    <tr>
        <td width="33%" valign="top">
            <img src="/.github/assets/blood_at_coords.png" />
            Player's blood is left on <b>ground</b> if they loose more then 5 hp.
        </td>
        <td width="33%" valign="top">
            <img src="/.github/assets/blood_at_vehicle_seat.png" />
            If they are inside a vehicle the blood is left at their current <b>seat in that vehicle</b>.
        </td>
        <td width="33%" valign="top">
            <img src="/.github/assets/blood_at_weapon.png" />
            Player's blood is left on every <b>weapon item</b> used to attack them in a melee.
        </td>
    </tr>
    <tr>
        <td colspan="2">
            If the blood is not already present on an item, it must be transferred to a <code>baggy_blood</code> in order to continue <a href="#fingerprint-and-dna-app">working with it</a>.
            Therefore, the evidence has to be collected by targetting on it or its holder (this requires a <code>baggy_empty</code>) before it gets destroyed by another player using <code>hydrogen_peroxide</code> or rain.
            <br>
            <p align="center">
                <img src="/.github/setup/images/baggy_blood.png">
                <img src="/.github/setup/images/baggy_empty.png">
                <img src="/.github/setup/images/hydrogen_peroxide.png">
            </p>
        </td>
    </tr>
</table>


### Magazines

<table width="100%">
    <tr>
        <td width="33%">
            <img src="/.github/assets/magazine_at_coords.png" />
        </td>
        <td width="66%">
            When reloading their weapon, players drop their old magazine <b>on the ground</b> or into the footwell of their <b>current vehicle</b>.
            Collecting magazines requires a <code>baggy_empty</code> item.
            A collected <code>baggy_magazine</code> doesn't need to be analyzed as the serial number and name of the associated weapon will be attached to its description.
        </td>
    </tr>
</table>

---

### Evidence Laptop

By using the `evidence_laptop` item, players can place evidence laptops on a table. After that, they can target the laptop to flip it open and access it. Once placed, the laptop will remain in its position (even persisting through server restarts) until it's picked up again.

<p align="center">
    <img src="/.github/assets/evidence_laptop.gif">
</p>

Only players with an autorized job can acces those laptops. They log into their user account automatically, so there is no need for creating/deleting accounts and no one has to remember their password. You can edit the list of allowed jobs in `config.lua`:
```lua
26      config.allowedJobs = {
27          "police", "fib"
28      }
```

> [!TIP]
> You can change the laptop's background image and app icons by replacing the png files at `html/dui/laptop/src/assets/`.


#### Fingerprint and DNA App

If you have an item holding a fingerprint/DNA, you can analyze it on the evidence laptop by using the fingerprint/DNA app.

On the left side of the app, all those items in your inventory and evidence boxes are displayed. By selecting an item from the sidebar, you can apply changes to the crime scene, time of collection and additional information (this data is always pre-filled on evidences that you collect), as well as the displayed database entry to the label of the evidence. If a database record exists for a fingerprint/DNA on the selected piece of evidence, it is displayed on the lower half of the app and can be edited; otherwise, a new record can be created.

<p align="center">
    <img src="/.github/assets/fingerprint_app.gif" />
</p>


#### 📁 Database App

The database app allows you to view, edit and delete all database entries that are associated to a fingerprint or DNA:

<p align="center">
    <img src="/.github/assets/database_app.png" width="854px"> 
</p>


### Evidence Box

The `evidence_box` item allows you to store evidence in a structured and space-saving manner. They can be labeled with the corresponding crime scene or case file, for example.

All evidence-holding items placed in an evidence box in your inventory will be displayed in the fingerprint and DNA app in the same way as evidence held directly in your inventory.

<p align="center">
    <img src="/.github/assets/evidence_box.png">
</p>


## How to use the built-in api (server only)

You can create or delete evidences in custom scenarios using the built-in api.

First, you need to get the object that represents the owner of an evidence type.
Available evidence types are: `FINGERPRINT` or `DNA`, which reference a player ID or biometric data as the owner, and `WEAPON`, which references a serial number.
```lua
local evidence <const> = exports.evidences:get(evidenceType, owner)
```

Now you can make multiple entity, vehicle seat, vehicle door, player, item or a specific location hold that evidence or remove it from them:
```lua
-- Binds the evidence to an entity. It can be destroyed or collected by targetting the entity.
-- While destroying the evidence triggers the removeFromEntity() function, collecting the evidence also transfers it to an item created for that purpose.
---@param entity number The netId of the entity the evidence should be bound to
---@param metadata? table
evidence:atEntity(entity, metadata)
evidence:removeFromEntity(entity)

-- Binds the evidence to a seat of a vehicle. Targetting the evidence requires the player to sit on this seat inside the vehicle.
-- A maximum of one evidence is bound to the vehicle, whereby a separate key is stored in the data of the evidence at the entity for each individual seat.
---@param vehicle number The netId of the vehicle the evidence should be bound to
---@param seatId number The id of the seat (look at https://docs.fivem.net/natives/?_0x22AC59A870E6A669 for a list of seat indices)
---@param metadata? table
evidence:atVehicleSeat(vehicle, seatId, metadata)
evidence:removeFromVehicleSeats(vehicle, seatIds)

-- Binds the evidence to a door of a vehicle. If 0 < vehicle door count ≤ 4 targetting the evidence requires the player to look at exactly that door otherwise targetting the vehicle is sufficient.
-- The storing of multiple pieces of evidence of one owner on different doors of the same vehicle is similar to the procedure for vehicle seats (see above).
---@param vehicle number The netId of the vehicle the evidence should be bound to
---@param doorId number The id of the door (look at https://docs.fivem.net/natives/?_0x93D9BD300D7789E5 for a list of door indices)
---@param metadata? table
evidence:atVehicleDoor(vehicle, doorId, metadata)
evidence:removeFromVehicleDoors(vehicle, doorIds)

-- Binds the evidence to a player. It can be destroyed or collected by targetting the player.
-- While destroying the evidence triggers the removeFromPlayer() function, collecting the evidence also transfers it to an item created for that purpose.
---@param playerId number The serverId of the player the evidence should be bound to
---@param metadata? table
evidence:atPlayer(playerId, metadata)
evidence:removeFromPlayer(playerId)

-- Creates an collectable evidence at the given coords.
-- While destroying the evidence triggers the removeFromCoords() function, collecting the evidence also transfers it to an item created for that purpose.
---@param coords vector3 The coords of for that evidence
---@param metadata? table
evidence:atCoords(coords, metadata)
evidence:removeFromCoords(coords)

-- Binds the evidence to an item. Items can hold only one evidence of each type at a time. The currently stored evidence of this type on the item is overwritten.
-- Those items holding evidences inventories or inside containers in the inventories are listet in the dna and fingerprint app on the evidence laptop.
-- Items holding magazine type evidences are labeled with some of the given data.
---@param inventory table|string|number The inventory of the item holding the evidence (cf. https://coxdocs.dev/ox_inventory/Functions/Server#additem)
---@param slot number The slot of the item in the inventory
---@param data? table
evidence:atItem(inventory, slot, data)

-- Removes the evidence from the given item.
---@param inventory table|string|number The inventory of the item holding the evidence (cf. https://coxdocs.dev/ox_inventory/Functions/Server#additem)
---@param slot number The slot of the item in the inventory
evidence:removeFromItem(inventory, slot)

-- Binds the evidence to the last item a player used.
---@param playerId number The serverId of the player
---@param data? table
evidence:atLastUsedItemOf(playerId, data)

-- Binds the evidence to the current weapon of a player.
---@param playerId number The serverId of the player
---@param data? table
evidence:atWeaponOf(attacker, data)
```


Moreover, you can get a player's biometric data by calling:
```lua
exports.evidences:getFingerprint(playerId)
exports.evidences:getDNA(playerId)
```

## License
This project is licensed under the GNU General Public License v3.0 or later.
See the [LICENSE](LICENSE) file for the full text.  
Copyright &copy; 2025 noobsystems (https://github.com/noobsystems)
