Config = {}

-------------------
-- false = use command to open the market | true = use blips to open the market
Config.UseBlipToAccessMarket = true

-- If false:
-- This will let the player open the market anywhere
Config.MarketCommand = "market" -- Command to open the market

-- If true:
Config.OpenMarketKey = 38 -- [E] Key to open the interaction, check here the keys ID: https://docs.fivem.net/docs/game-references/controls/#controls

Config.ShowFloorBlips = true -- If true it'll show the crafting markers on the floor

Config.UseOkokTextUI = true -- true = okokTextUI (I recommend you using this since it is way more optimized than the default ShowHelpNotification) | false = ShowHelpNotification

Config.ShowBlipsOnMap = true -- Will show the blips on the map (if true it'll use the blipId, blipColor, blipScale and blipText to create them)

Config.BlipCoords = { 
	{x = -1082.2, y = -247.7, z = 37.75, radius = 2, blipId = 78, blipColor = 3, blipScale = 0.9, blipText = "Marketplace", showMarkerRadius = 50, MarkerID = 29},
	{x = -1075.4, y = -247.2, z = 44.02, radius = 2, blipId = 78, blipColor = 3, blipScale = 0.9, blipText = "Marketplace", showMarkerRadius = 50, MarkerID = 29},
	{x = 0.0, y = 0.0, z = 0.0, radius = 2, blipId = 78, blipColor = 3, blipScale = 0.9, blipText = "Marketplace", showMarkerRadius = 50, MarkerID = 29},
}
-- x, y, z, radius: Coordinates of the market blips and interaction radius
-- blipId, blipColor, blipScale, blipText: blips on the map: https://docs.fivem.net/docs/game-references/blips/
-- MarkerID: id of the marker on the ground https://docs.fivem.net/docs/game-references/markers/
-- showMarkerRadius: How close you need to be to see the marker
-------------------

-- Jobs that can access the blackmarket
Config.BlackmarketAllowedJobs = {
	{
		job = "police", -- Job that can access the blackmarket
		grade = { -- Grades that can access the blackmarket
			"boss",
			"rookie",
		}
	},
	{
		job = "ballas",
		grade = { -- If this field is blank all grades can access it
			
		}
	},
}

-- true = use dirty money on blackmarket | false = use bank money on blackmarket
Config.UseDirtyMoneyOnBlackmarket = false

Config.Blackmarket = { -- (item/weapon) / if is weapon then: {"weapon id", true}, if is item then: {"item id", false} (all blackmarket items need to be on the BlacklistItems)
	{"WEAPON_ASSAULTRIFLE", true},
	{"WEAPON_PISTOL", true},
	{"bandage", false},
	{"grip", false},
	{"trigger", false},
}

Config.BlacklistItems = { -- items/weapons that are not allowed to be sold on normal market
	"bandage",
	"grip",
	"trigger",
	"WEAPON_ASSAULTRIFLE",
	"WEAPON_PISTOL",
}

Config.BlacklistVehicles = { -- all vehicles that are not allowed to be sold on the market (check the gameName on vehicles.meta -> <gameName>Supra</gameName>)
	"Supra",
	"M8",
}

-------------------------- DISCORD LOGS

-- To set your Discord Webhook URL go to server.lua, line 2

Config.BotName = 'ServerName' -- Write the desired bot name

Config.ServerName = 'ServerName' -- Write your server's name

Config.IconURL = '' -- Insert your desired image link

Config.DateFormat = '%d/%m/%Y [%X]' -- To change the date format check this website - https://www.lua.org/pil/22.1.html

-- To change a webhook color you need to set the decimal value of a color, you can use this website to do that - https://www.mathsisfun.com/hexadecimal-decimal-colors.html

Config.AddAdColor = '6225733'

Config.BuyItemColor = '224'

Config.RemoveAdColor = '16711680'

Config.ClaimAdColor = '12231480'