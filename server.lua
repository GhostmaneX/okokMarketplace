ESX = nil
local Webhook = ''

TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

ESX.RegisterServerCallback('okokMarketplace:getItems', function(source, cb)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local vehicles = {}
	local loadout = xPlayer.getLoadout()

	MySQL.Async.fetchAll('SELECT * FROM owned_vehicles WHERE owner = @owner AND Type = @Type AND job = @job AND `stored` = 1', {
		['@owner'] = xPlayer.identifier,
		['@Type'] = 'car',
		['@job'] = 'civ',
	}, function(data) 
		for _,v in pairs(data) do
			local vehicle = json.decode(v.vehicle)
			table.insert(vehicles, {vehicle = vehicle, plate = v.plate})
		end
		cb(vehicles, xPlayer.getInventory(), loadout)
	end)
end)

ESX.RegisterServerCallback('okokMarketplace:getAds', function(source, cb)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_vehicles ORDER BY id ASC', {
	}, function(veh) 
		MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_items ORDER BY id ASC', {
		}, function(items) 
			MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_blackmarket ORDER BY id ASC', {
			}, function(blackmarket) 
				cb(veh, items, blackmarket, xPlayer.identifier)
			end)
		end)
	end)
end)

ESX.RegisterServerCallback('okokMarketplace:phone', function(source, cb)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	MySQL.Async.fetchAll('SELECT * FROM users WHERE identifier = @identifier',{
		['@identifier'] = xPlayer.identifier
	}, function(result)
		cb(result[1].phone_number)
	end)
end)



RegisterServerEvent("okokMarketplace:addVehicle")
AddEventHandler("okokMarketplace:addVehicle", function(vehicle, price, desc, phone_number)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local plate = vehicle.plate
	local id = plate:gsub("%s+", "")

	MySQL.Async.execute('UPDATE owned_vehicles SET owner = @owner WHERE plate = @plate', {
		['@plate'] = vehicle.plate,
		['@owner'] = "selling",
	})

	MySQL.Async.insert('INSERT INTO okokMarketplace_vehicles (item_id, plate, label, author_identifier, author_name, phone_number, description, price, start_date) VALUES (@item_id, @plate, @label, @author_identifier, @author_name, @phone_number, @description, @price, @start_date)', {
		['@item_id'] = id,
		['@plate'] = plate,
		['@label'] = vehicle.name,
		['@author_identifier'] = xPlayer.identifier,
		['@author_name'] = xPlayer.getName(),
		['@phone_number'] = phone_number,
		['@description'] = desc,
		['@price'] = price,
		['@start_date'] = os.date("%d/%m - %H:%M"),
	}, function(result)
		TriggerClientEvent('okokMarketplace:updateVehiclesDropdown', xPlayer.source)
		TriggerClientEvent('okokMarketplace:updateVehicles', xPlayer.source)
		TriggerClientEvent('okokMarketplace:updateMyAdsTable', xPlayer.source)
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You are now selling the vehicle "..vehicle.name.." ("..vehicle.plate..")", 5000, 'success')

		if Webhook ~= '' then
			local identifierlist = ExtractIdentifiers(xPlayer.source)
			local data = {
				playerid = xPlayer.source,
				identifier = identifierlist.license:gsub("license2:", ""),
				discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
				type = "add",
				action = "Added an Ad",
				item = vehicle.name.." ("..vehicle.plate..")",
				price = price,
				desc = desc,
				title = "MARKETPLACE - Vehicles",
			}
			discordWenhook(data)
		end
	end)
end)

RegisterServerEvent("okokMarketplace:addItem")
AddEventHandler("okokMarketplace:addItem", function(item, amount, price, desc, phone_number)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local amount = tonumber(amount)

	if xPlayer.getInventoryItem(item.id).count >= amount and amount > 0 then
		MySQL.Async.insert('INSERT INTO okokMarketplace_items (item_id, label, amount, author_identifier, author_name, phone_number, description, price, start_date) VALUES (@item_id, @label, @amount, @author_identifier, @author_name, @phone_number, @description, @price, @start_date)', {
			['@item_id'] = item.id,
			['@label'] = item.label,
			['@amount'] = amount,
			['@author_identifier'] = xPlayer.identifier,
			['@author_name'] = xPlayer.getName(),
			['@phone_number'] = phone_number,
			['@description'] = desc,
			['@price'] = price,
			['@start_date'] = os.date("%d/%m - %H:%M"),
		}, function(result)
			TriggerClientEvent('okokMarketplace:updateItemsDropdown', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateItems', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateMyAdsTable', xPlayer.source)
			xPlayer.removeInventoryItem(item.id, amount)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You are now selling the item "..item.label.." ("..amount..")", 5000, 'success')

			if Webhook ~= '' then
				local identifierlist = ExtractIdentifiers(xPlayer.source)
				local data = {
					playerid = xPlayer.source,
					identifier = identifierlist.license:gsub("license2:", ""),
					discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
					type = "add",
					action = "Added an Ad",
					item = item.label.." (x"..amount..")",
					price = price,
					desc = desc,
					title = "MARKETPLACE - Items",
				}
				discordWenhook(data)
			end
		end)
	else
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough items to sell", 5000, 'error')
	end
end)

RegisterServerEvent("okokMarketplace:addBlackmarket")
AddEventHandler("okokMarketplace:addBlackmarket", function(item, price, desc, phone_number, amount)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	if item.type == "weapon" and xPlayer.hasWeapon(item.id) and amount <= item.count then
		MySQL.Async.insert('INSERT INTO okokMarketplace_blackmarket (item_id, label, type, amount, author_identifier, author_name, phone_number, description, price, start_date) VALUES (@item_id, @label, @type, @amount, @author_identifier, @author_name, @phone_number, @description, @price, @start_date)', {
			['@item_id'] = item.id,
			['@label'] = item.label,
			['@type'] = item.type,
			['@amount'] = amount,
			['@author_identifier'] = xPlayer.identifier,
			['@author_name'] = xPlayer.getName(),
			['@phone_number'] = phone_number,
			['@description'] = desc,
			['@price'] = price,
			['@start_date'] = os.date("%d/%m - %H:%M"),
		}, function(result)
			TriggerClientEvent('okokMarketplace:updateBlackmarketDropdown', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateBlackmarket', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateMyAdsTable', xPlayer.source)
			xPlayer.removeWeapon(item.id, amount)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You are now selling the item "..item.label, 5000, 'success')

			if Webhook ~= '' then
				local identifierlist = ExtractIdentifiers(xPlayer.source)
				local data = {
					playerid = xPlayer.source,
					identifier = identifierlist.license:gsub("license2:", ""),
					discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
					type = "add",
					action = "Added an Ad",
					item = item.label.." (x"..amount..")",
					price = price,
					desc = desc,
					title = "MARKETPLACE - Blackmarket",
				}
				discordWenhook(data)
			end
		end)
	elseif item.type == "item" and xPlayer.getInventoryItem(item.id).count > 0 and amount <= xPlayer.getInventoryItem(item.id).count then
		MySQL.Async.insert('INSERT INTO okokMarketplace_blackmarket (item_id, label, type, amount, author_identifier, author_name, phone_number, description, price, start_date) VALUES (@item_id, @label, @type, @amount, @author_identifier, @author_name, @phone_number, @description, @price, @start_date)', {
			['@item_id'] = item.id,
			['@label'] = item.label,
			['@type'] = item.type,
			['@amount'] = amount,
			['@author_identifier'] = xPlayer.identifier,
			['@author_name'] = xPlayer.getName(),
			['@phone_number'] = phone_number,
			['@description'] = desc,
			['@price'] = price,
			['@start_date'] = os.date("%d/%m - %H:%M"),
		}, function(result)
			TriggerClientEvent('okokMarketplace:updateBlackmarketDropdown', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateBlackmarket', xPlayer.source)
			TriggerClientEvent('okokMarketplace:updateMyAdsTable', xPlayer.source)
			xPlayer.removeInventoryItem(item.id, amount)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You are now selling the item "..item.label, 5000, 'success')
			if Webhook ~= '' then
				local identifierlist = ExtractIdentifiers(xPlayer.source)
				local data = {
					playerid = xPlayer.source,
					identifier = identifierlist.license:gsub("license2:", ""),
					discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
					type = "add",
					action = "Added an Ad",
					item = item.label.." (x"..amount..")",
					price = price,
					desc = desc,
					title = "MARKETPLACE - Blackmarket",
				}
				discordWenhook(data)
			end
		end)
	else
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough "..item.label.." to sell", 5000, 'error')
	end
end)

ESX.RegisterServerCallback('okokMarketplace:getVehicle', function(source, cb, id)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_vehicles WHERE item_id = @item_id AND sold = false', {
		['@item_id'] = id,
	}, function(veh)
		if veh[1] ~= nil then
			cb(veh)
		else
			TriggerClientEvent('okokMarketplace:updateVehicles', xPlayer.source)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "This vehicle is no longer for sale", 5000, 'error')
		end
	end)
end)

ESX.RegisterServerCallback('okokMarketplace:getItem', function(source, cb, id, item)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_items WHERE id = @id AND item_id = @item_id AND sold = false', {
		['@id'] = id,
		['@item_id'] = item,
	}, function(item)
		if item[1] ~= nil then
			cb(item)
		else
			TriggerClientEvent('okokMarketplace:updateItems', xPlayer.source)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "This item is no longer for sale", 5000, 'error')
		end
	end)
end)

ESX.RegisterServerCallback('okokMarketplace:getBlackmarket', function(source, cb, id, blackmarket)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_blackmarket WHERE id = @id AND item_id = @item_id AND sold = false', {
		['@id'] = id,
		['@item_id'] = blackmarket,
	}, function(blackmarket)
		if blackmarket[1] ~= nil then
			cb(blackmarket)
		else
			TriggerClientEvent('okokMarketplace:updateBlackmarket', xPlayer.source)
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "This item is no longer for sale", 5000, 'error')
		end
	end)
end)

RegisterServerEvent("okokMarketplace:buyVehicle")
AddEventHandler("okokMarketplace:buyVehicle", function(veh)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local xTarget = ESX.GetPlayerFromIdentifier(veh[1].author_identifier)
	local money = xPlayer.getAccount('bank').money
	local price = tonumber(veh[1].price)

	if money >= price then
		MySQL.Async.execute('UPDATE okokmarketplace_vehicles SET sold = 1 WHERE plate = @plate AND sold = 0', {['@plate'] = veh[1].plate},
		function (rowsChanged)
			if rowsChanged > 0 then
				xPlayer.removeAccountMoney('bank', price)
				MySQL.Async.execute('UPDATE owned_vehicles SET owner = @owner WHERE plate = @plate', {
					['@plate'] = veh[1].plate,
					['@owner'] = xPlayer.identifier,
				})
				TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You bought the vehicle "..veh[1].label.." ("..veh[1].plate..")", 5000, 'success')
				TriggerClientEvent('okokMarketplace:updateVehiclesDropdown', xPlayer.source)
				TriggerClientEvent('okokMarketplace:updateVehicles', xPlayer.source)
				if xTarget ~= nil then
					TriggerClientEvent('okokNotify:Alert', xTarget.source, "MARKET", "You sold the vehicle "..veh[1].label.." ("..veh[1].plate..")", 5000, 'success')
				end
				if Webhook ~= '' then
					local identifierlist = ExtractIdentifiers(xPlayer.source)
					local data = {
						playerid = xPlayer.source,
						identifier = identifierlist.license:gsub("license2:", ""),
						discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
						type = "buy",
						action = "Bought a vehicle",
						item = veh[1].label.." ("..veh[1].plate..")",
						price = veh[1].price,
						desc = veh[1].description,
						from = veh[1].author_name.." ("..veh[1].author_identifier..")",
						title = "MARKETPLACE - Vehicles",
					}
					discordWenhook(data)
				end
			else
				TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
			end
		end)
	else
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough money to buy this vehicle", 5000, 'error')
	end
end)

RegisterServerEvent("okokMarketplace:buyItem")
AddEventHandler("okokMarketplace:buyItem", function(item)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local xTarget = ESX.GetPlayerFromIdentifier(item[1].author_identifier)
	local money = xPlayer.getAccount('bank').money
	local price = tonumber(item[1].price)

	if money >= price then
		MySQL.Async.execute('UPDATE okokmarketplace_items SET sold = 1 WHERE id = @id AND item_id = @item_id AND sold = 0', {
			['@id'] = item[1].id,
			['@item_id'] = item[1].item_id,
		},function (rowsChanged)
			if rowsChanged > 0 then
				xPlayer.removeAccountMoney('bank', price)
				xPlayer.addInventoryItem(item[1].item_id, item[1].amount)

				TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You bought the item "..item[1].label.." (x"..item[1].amount..")", 5000, 'success')
				TriggerClientEvent('okokMarketplace:updateItemsDropdown', xPlayer.source)
				TriggerClientEvent('okokMarketplace:updateItems', xPlayer.source)
				if xTarget ~= nil then
					TriggerClientEvent('okokNotify:Alert', xTarget.source, "MARKET", "You sold the item "..item[1].label.." (x"..item[1].amount..")", 5000, 'success')
				end
				if Webhook ~= '' then
					local identifierlist = ExtractIdentifiers(xPlayer.source)
					local data = {
						playerid = xPlayer.source,
						identifier = identifierlist.license:gsub("license2:", ""),
						discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
						type = "buy",
						action = "Bought an item",
						item = item[1].label.." (x"..item[1].amount..")",
						price = item[1].price,
						desc = item[1].description,
						from = item[1].author_name.." ("..item[1].author_identifier..")",
						title = "MARKETPLACE - Items",
					}
					discordWenhook(data)
				end
			else
				TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
			end
		end)
	else
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough money to buy this item", 5000, 'error')
	end
end)

RegisterServerEvent("okokMarketplace:buyBlackmarket")
AddEventHandler("okokMarketplace:buyBlackmarket", function(blackmarket)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)
	local xTarget = ESX.GetPlayerFromIdentifier(blackmarket[1].author_identifier)
	local money
	local price = tonumber(blackmarket[1].price)

	if Config.UseDirtyMoneyOnBlackmarket then
		money = xPlayer.getAccount('black_money').money
	else
		money = xPlayer.getAccount('bank').money
	end

	if money >= price then
		
		if blackmarket[1].type == "item" and xPlayer.canCarryItem(blackmarket[1].item_id, 1) then
			MySQL.Async.execute('UPDATE okokMarketplace_blackmarket SET sold = 1 WHERE id = @id AND item_id = @item_id AND sold = 0', {
					['@id'] = blackmarket[1].id,
					['@item_id'] = blackmarket[1].item_id,
				},function (rowsChanged)
					if rowsChanged > 0 then
						xPlayer.addInventoryItem(blackmarket[1].item_id, blackmarket[1].amount)
						if Config.UseDirtyMoneyOnBlackmarket then
							xPlayer.removeAccountMoney('black_money', price)
						else
							xPlayer.removeAccountMoney('bank', price)
						end

						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You bought the item "..blackmarket[1].label, 5000, 'success')
						TriggerClientEvent('okokMarketplace:updateBlackmarketDropdown', xPlayer.source)
						TriggerClientEvent('okokMarketplace:updateBlackmarket', xPlayer.source)
						if xTarget ~= nil then
							TriggerClientEvent('okokNotify:Alert', xTarget.source, "MARKET", "You sold the item "..blackmarket[1].label, 5000, 'success')
						end
						if Webhook ~= '' then
							local identifierlist = ExtractIdentifiers(xPlayer.source)
							local data = {
								playerid = xPlayer.source,
								identifier = identifierlist.license:gsub("license2:", ""),
								discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
								type = "buy",
								action = "Bought an item",
								item = blackmarket[1].label.." (x"..blackmarket[1].amount..")",
								price = blackmarket[1].price,
								desc = blackmarket[1].description,
								from = blackmarket[1].author_name.." ("..blackmarket[1].author_identifier..")",
								title = "MARKETPLACE - Blackmarket",
							}
							discordWenhook(data)
						end
					else
						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
					end
				end)

			

		elseif blackmarket[1].type == "weapon" and not xPlayer.hasWeapon(blackmarket[1].item_id) then
			MySQL.Async.execute('UPDATE okokMarketplace_blackmarket SET sold = 1 WHERE id = @id AND item_id = @item_id AND sold = 0', {
				['@id'] = blackmarket[1].id,
				['@item_id'] = blackmarket[1].item_id,
			},function (rowsChanged)
				if rowsChanged > 0 then
					xPlayer.addWeapon(blackmarket[1].item_id, blackmarket[1].amount)
					if Config.UseDirtyMoneyOnBlackmarket then
						xPlayer.removeAccountMoney('black_money', price)
					else
						xPlayer.removeAccountMoney('bank', price)
					end

					TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You bought the item "..blackmarket[1].label, 5000, 'success')
					TriggerClientEvent('okokMarketplace:updateBlackmarketDropdown', xPlayer.source)
					TriggerClientEvent('okokMarketplace:updateBlackmarket', xPlayer.source)
					if xTarget ~= nil then
						TriggerClientEvent('okokNotify:Alert', xTarget.source, "MARKET", "You sold the item "..blackmarket[1].label, 5000, 'success')
					end
					if Webhook ~= '' then
						local identifierlist = ExtractIdentifiers(xPlayer.source)
						local data = {
							playerid = xPlayer.source,
							identifier = identifierlist.license:gsub("license2:", ""),
							discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
							type = "buy",
							action = "Bought an item",
							item = blackmarket[1].label.." (x"..blackmarket[1].amount..")",
							price = blackmarket[1].price,
							desc = blackmarket[1].description,
							from = blackmarket[1].author_name.." ("..blackmarket[1].author_identifier..")",
							title = "MARKETPLACE - Blackmarket",
						}
						discordWenhook(data)
					end
				else
					TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
				end
			end)
		else
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You can't carry this item", 5000, 'error')
		end
	else
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough money to buy this item", 5000, 'error')
	end
end)

RegisterServerEvent("okokMarketplace:removeMyAd")
AddEventHandler("okokMarketplace:removeMyAd", function(item)
	local _source = source
	local xPlayer = ESX.GetPlayerFromId(_source)

	if item.plate then
		MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_vehicles WHERE item_id = @item_id AND id = @id', {
			['@item_id'] = item.item_id,
			['@id'] = item.id,
		}, function(veh)
			MySQL.Async.execute('DELETE FROM okokMarketplace_vehicles WHERE item_id = @item_id AND id = @id', {
				['@id'] = veh[1].id,
				['@item_id'] = veh[1].item_id,
			},function (rowDeleted)
				if rowDeleted > 0 then
					if veh[1].sold then
						xPlayer.addAccountMoney('bank', tonumber(veh[1].price))
						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You claimed "..veh[1].price.." €", 5000, 'success')
						if Webhook ~= '' then
							local identifierlist = ExtractIdentifiers(xPlayer.source)
							local data = {
								playerid = xPlayer.source,
								identifier = identifierlist.license:gsub("license2:", ""),
								discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
								type = "claim",
								action = "Claimed an Ad",
								item = veh[1].label.." ("..veh[1].plate..")",
								price = veh[1].price,
								desc = veh[1].description,
								title = "MARKETPLACE - Vehicles",
							}
							discordWenhook(data)
						end
					else
						MySQL.Async.execute('UPDATE owned_vehicles SET owner = @owner WHERE plate = @plate', {
							['@plate'] = veh[1].plate,
							['@owner'] = veh[1].author_identifier,
						})
						TriggerClientEvent('okokMarketplace:updateVehiclesDropdown', xPlayer.source)
						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You canceled the AD "..veh[1].label.." ("..veh[1].plate..")", 5000, 'success')
						if Webhook ~= '' then
							local identifierlist = ExtractIdentifiers(xPlayer.source)
							local data = {
								playerid = xPlayer.source,
								identifier = identifierlist.license:gsub("license2:", ""),
								discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
								type = "cancel",
								action = "Canceled an Ad",
								item = veh[1].label.." ("..veh[1].plate..")",
								price = veh[1].price,
								desc = veh[1].description,
								title = "MARKETPLACE - Vehicles",
							}
							discordWenhook(data)
						end
					end
				else
					TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
				end
			end)
		end)
	elseif item.type then
		MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_blackmarket WHERE item_id = @item_id AND id = @id', {
			['@item_id'] = item.item_id,
			['@id'] = item.id,
		}, function(blackmarket)
			local canCarry = true

			if not blackmarket[1].sold then
				if blackmarket[1].type == "weapon" and xPlayer.hasWeapon(blackmarket[1].item_id) then
					canCarry = false
					TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough space to carry this item", 5000, 'error')
				elseif blackmarket[1].type == "item" and not xPlayer.canCarryItem(blackmarket[1].item_id, tonumber(blackmarket[1].amount)) then
					canCarry = false
					TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough space to carry this item", 5000, 'error')
				end
			end

			if canCarry then
				MySQL.Async.execute('DELETE FROM okokMarketplace_blackmarket WHERE item_id = @item_id AND id = @id', {
					['@id'] = blackmarket[1].id,
					['@item_id'] = blackmarket[1].item_id,
				},function (rowDeleted)
					if rowDeleted > 0 then
						if blackmarket[1].sold then
							xPlayer.addAccountMoney('bank', tonumber(blackmarket[1].price))
							TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You claimed "..blackmarket[1].price.." €", 5000, 'success')
							if Webhook ~= '' then
								local identifierlist = ExtractIdentifiers(xPlayer.source)
								local data = {
									playerid = xPlayer.source,
									identifier = identifierlist.license:gsub("license2:", ""),
									discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
									type = "claim",
									action = "Claimed an Ad",
									item = blackmarket[1].label.." (x"..blackmarket[1].amount..")",
									price = blackmarket[1].price,
									desc = blackmarket[1].description,
									title = "MARKETPLACE - Blackmarket",
								}
								discordWenhook(data)
							end
						else
							if blackmarket[1].type == "weapon" then
								xPlayer.addWeapon(blackmarket[1].item_id, 1)
							elseif blackmarket[1].type == "item" then
								xPlayer.addInventoryItem(blackmarket[1].item_id, tonumber(blackmarket[1].amount))
							end
							TriggerClientEvent('okokMarketplace:updateBlackmarketDropdown', xPlayer.source)
							TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You canceled the AD "..blackmarket[1].label.." (x"..blackmarket[1].amount..")", 5000, 'success')
							if Webhook ~= '' then
								local identifierlist = ExtractIdentifiers(xPlayer.source)
								local data = {
									playerid = xPlayer.source,
									identifier = identifierlist.license:gsub("license2:", ""),
									discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
									type = "cancel",
									action = "Canceled an Ad",
									item = blackmarket[1].label.." (x"..blackmarket[1].amount..")",
									price = blackmarket[1].price,
									desc = blackmarket[1].description,
									title = "MARKETPLACE - Blackmarket",
								}
								discordWenhook(data)
							end
						end
					else
						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
					end
				end)
			end
		end)
	else
		MySQL.Async.fetchAll('SELECT * FROM okokMarketplace_items WHERE item_id = @item_id AND id = @id', {
			['@item_id'] = item.item_id,
			['@id'] = item.id,
		}, function(items)
			if xPlayer.canCarryItem(items[1].item_id, tonumber(items[1].amount)) then
				MySQL.Async.execute('DELETE FROM okokMarketplace_items WHERE item_id = @item_id AND id = @id', {
					['@id'] = items[1].id,
					['@item_id'] = items[1].item_id,
				},function (rowDeleted)
					if rowDeleted > 0 then
						if items[1].sold then
							xPlayer.addAccountMoney('bank', tonumber(items[1].price))
							TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You claimed "..items[1].price.." €", 5000, 'success')
							if Webhook ~= '' then
								local identifierlist = ExtractIdentifiers(xPlayer.source)
								local data = {
									playerid = xPlayer.source,
									identifier = identifierlist.license:gsub("license2:", ""),
									discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
									type = "claim",
									action = "Claimed an Ad",
									item = items[1].label.." (x"..items[1].amount..")",
									price = items[1].price,
									desc = items[1].description,
									title = "MARKETPLACE - Items",
								}
								discordWenhook(data)
							end
						else
							xPlayer.addInventoryItem(items[1].item_id, tonumber(items[1].amount))
							TriggerClientEvent('okokMarketplace:updateItemsDropdown', xPlayer.source)
							TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You canceled the AD "..items[1].label.." (x"..items[1].amount..")", 5000, 'success')
							if Webhook ~= '' then
								local identifierlist = ExtractIdentifiers(xPlayer.source)
								local data = {
									playerid = xPlayer.source,
									identifier = identifierlist.license:gsub("license2:", ""),
									discord = "<@"..identifierlist.discord:gsub("discord:", "")..">",
									type = "cancel",
									action = "Canceled an Ad",
									item = items[1].label.." (x"..items[1].amount..")",
									price = items[1].price,
									desc = items[1].description,
									title = "MARKETPLACE - Items",
								}
								discordWenhook(data)
							end
						end
					else
						TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "Something went wrong, please try again later!", 5000, 'error')
					end
				end)
			else
				TriggerClientEvent('okokNotify:Alert', xPlayer.source, "MARKET", "You don't have enough space to carry this item", 5000, 'error')
			end
		end)
	end
	TriggerClientEvent('okokMarketplace:updateMyAds', xPlayer.source)
end)

-------------------------- IDENTIFIERS

function ExtractIdentifiers(id)
	local identifiers = {
		steam = "",
		ip = "",
		discord = "",
		license = "",
		xbl = "",
		live = ""
	}

	for i = 0, GetNumPlayerIdentifiers(id) - 1 do
		local playerID = GetPlayerIdentifier(id, i)

		if string.find(playerID, "steam") then
			identifiers.steam = playerID
		elseif string.find(playerID, "ip") then
			identifiers.ip = playerID
		elseif string.find(playerID, "discord") then
			identifiers.discord = playerID
		elseif string.find(playerID, "license") then
			identifiers.license = playerID
		elseif string.find(playerID, "xbl") then
			identifiers.xbl = playerID
		elseif string.find(playerID, "live") then
			identifiers.live = playerID
		end
	end

	return identifiers
end

-------------------------- WEBHOOK

function discordWenhook(data)
	local color = '65352'
	local category = 'test'

	local information = {}

	if data.type == 'add' then
		color = Config.AddAdColor
	elseif data.type == 'buy' then
		color = Config.BuyItemColor
		information = {
			{
				["color"] = color,
				["author"] = {
					["icon_url"] = Config.IconURL,
					["name"] = Config.ServerName..' - Logs',
				},
				["title"] = data.title,
				["description"] = '**Action:** '..data.action..'\n**Item:** '..data.item..'\n**Price:** '..data.price..'\n**Description:** '..data.desc..'\n**From:** '..data.from..'\n\n**ID:** '..data.playerid..'\n**Identifier:** '..data.identifier..'\n**Discord:** '..data.discord,
				["footer"] = {
					["text"] = os.date(Config.DateFormat),
				}
			}
		}
	elseif data.type == 'cancel' then
		color = Config.RemoveAdColor
	elseif data.type == 'claim' then
		color = Config.ClaimAdColor
	end
	
	information = {
		{
			["color"] = color,
			["author"] = {
				["icon_url"] = Config.IconURL,
				["name"] = Config.ServerName..' - Logs',
			},
			["title"] = data.title,
			["description"] = '**Action:** '..data.action..'\n**Item:** '..data.item..'\n**Price:** '..data.price..'\n**Description:** '..data.desc..'\n\n**ID:** '..data.playerid..'\n**Identifier:** '..data.identifier..'\n**Discord:** '..data.discord,
			["footer"] = {
				["text"] = os.date(Config.DateFormat),
			}
		}
	}

	PerformHttpRequest(Webhook, function(err, text, headers) end, 'POST', json.encode({username = Config.BotName, embeds = information}), {['Content-Type'] = 'application/json'})
end