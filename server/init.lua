math.randomseed(os.time()) -- Seed the PRNG

lib.locale()
lib.versionCheck("noobsystems/evidences")

if not LoadResourceFile(cache.resource, "html/dui/laptop/dist/index.html") then
    lib.print.error("Setup step missing: Download the script from the releases section (https://github.com/noobsystems/evidences/releases/latest) or build the laptop dui")
    return
end

if require "server.items" then
    require "server.biometrics.biometrics_provider"

    require "server.evidences.api"

    require "server.evidences.actions"

    require "server.dui.callbacks"
    require "server.dui.laptops"

    require "server.wiretap.wiretap"

    require "server.commands"

    require "server.citizens.citizens"
    require "server.citizens.notes"

    require "server.firearms.firearms"

    require "server.biometrics.linked_biometrics"
    require "server.biometrics.biometrics_taking"

    require "server.scanner.scanner"
end