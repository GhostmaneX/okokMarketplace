var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
	return new bootstrap.Popover(popoverTriggerEl)
})

function addStr(str, index, stringToAdd){
	return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
}

var selectedWindow = "";
var items = [];
var itemsAds = [];
var vehicles = [];
var vehiclesTable = [];
var blackmarket = [];
var blackmarketAds = [];
var myAds = [];

window.addEventListener('message', function(event) {
	item = event.data;
	switch (event.data.action) {
		case 'openVehicleMarket':
			selectedWindow = "vehicles";
			sortByID = 1;
			$('#page-title').html(`Vehicles`);
			items = event.data.items;
			itemsAds = event.data.itemsAds;
			vehicles = event.data.vehicles;
			vehiclesTable = event.data.vehAds;
			blackmarket = event.data.blackmarket;
			blackmarketAds = event.data.blackmarketAds;
			myAds = event.data.myAds;

			$('#top-search').html(`
				<div class="input-group" style="margin-right: 10px;">
					<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
					<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
				</div>
				<div class="btn-group" style="margin-right: 10px;">
					<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
						<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
						<li><a class="dropdown-item" id="highest">Highest Price</a></li>
					</ul>
				</div>
				<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
				<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalVehicles"><i class="fas fa-plus"></i> Place an Ad</button>
			`);

			if(event.data.accessBlackmarket) {
				$('#sidebar').html(`
					<p class="sidebar-item mt-2 selected" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
					<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
					<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
				`);

				$('#sidebar-personal').html(`
					<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
						<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
						<span class="badge bg-danger">${myAds.length}</span>
					</p>
				`);
			} else {
				$('#sidebar').html(`
					<p class="sidebar-item mt-2 selected" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
					<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
				`);

				$('#sidebar-personal').html(`
					<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
						<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
						<span class="badge bg-danger">${myAds.length}</span>
					</p>
				`);
			}

			var ownedVehicles = vehicles;
			var num = ownedVehicles.length;
			var dropdown = `<option value="0" selected>Select a vehicle</option>`;

			for(var i = 0; i < num; i++) {
				dropdown += `
					<option value="${i+1}">${ownedVehicles[i].name} (${ownedVehicles[i].plate})</option>
				`;
			}
			$('#dropdown').html(dropdown);

			var vehiclesAds = event.data.vehAds;
			var num2 = vehiclesAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				added++
				var label = vehiclesAds[i].label;
				var img = label.replace(/\s/g, '');

				row += `
					<div class="col-md-3">
						<div class="card item_card d-flex flex-column">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${vehiclesAds[i].author_name}</div><div><b>Phone:</b> ${vehiclesAds[i].phone_number}</div><div><b>Description:</b> ${vehiclesAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${vehiclesAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer" style="margin-bottom: -50;">
									<div class="item-price text-center">${vehiclesAds[i].price} €</div>
									<div class="item-title text-center">${vehiclesAds[i].label}</div>
								</div>
							</div>
							<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${vehiclesAds[i].item_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
						</div>
					</div>
				`;

				if ((added) % 4 === 0) {
					row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
				}

				var myEle = document.getElementById(`${vehiclesAds[i].item_id}`);
				if(!myEle){
					modal += `<div class="modal fade" id="${vehiclesAds[i].item_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${vehiclesAds[i].label} for ${vehiclesAds[i].price}€</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
													<a id="confirmAction" href="#" class="${vehiclesAds[i].item_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
												</div>
											</div>
										</div>
									</div>
								</div>
					`;
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}

			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads available</span>
							</div>
							<div>
								<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$("body").fadeIn();
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})

			break
		case 'updateVehiclesDropdown':
			vehicles = event.data.vehicles;
			var ownedVehicles = vehicles;
			var num = ownedVehicles.length;
			var dropdown = `<option value="0" selected>Select a vehicle</option>`;

			for(var i = 0; i < num; i++) {
				dropdown += `
					<option value="${i+1}">${ownedVehicles[i].name} (${ownedVehicles[i].plate})</option>
				`;
			}
			$('#dropdown').html(dropdown);

			break
		case 'updateItemsDropdown':
			items = event.data.items;
			var num = items.length;
			var dropdown = `<option value="0" selected>Select an item</option>`;

			for(var i = 0; i < num; i++) {
				dropdown += `
					<option value="${i+1}">${items[i].label} (${items[i].count})</option>
				`;
			}
			$('#dropdown_items').html(dropdown);

			break
		case 'updateBlackmarketDropdown':
			blackmarket = event.data.blackmarket;
			var num = blackmarket.length;
			var dropdown = `<option value="0" selected>Select an item</option>`;

			for(var i = 0; i < num; i++) {
				dropdown += `
					<option value="${i+1}">${blackmarket[i].label} (${blackmarket[i].count})</option>
				`;
			}
			$('#dropdown_blackmarket').html(dropdown);

			break
		case 'updateVehicles':
			selectedWindow = "vehicles";
			$('#page-title').html(`Vehicles`);

			$('#sidebar').html(`
				<p class="sidebar-item mt-2 selected" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
				<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
				<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
			`);

			$('#sidebar-personal').html(`
				<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
					<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
					<span class="badge bg-danger">${myAds.length}</span>
				</p>
			`);

			vehiclesTable = event.data.vehAds;
			var vehiclesAds = vehiclesTable;
			var num2 = vehiclesAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				added++
				var label = vehiclesAds[i].label;
				var img = label.replace(/\s/g, '');
				row += `
					<div class="col-md-3">
						<div class="card item_card d-flex flex-column">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${vehiclesAds[i].author_name}</div><div><b>Phone:</b> ${vehiclesAds[i].phone_number}</div><div><b>Description:</b> ${vehiclesAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${vehiclesAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer" style="margin-bottom: -50;">
									<div class="item-price text-center">${vehiclesAds[i].price} €</div>
									<div class="item-title text-center">${vehiclesAds[i].label}</div>
								</div>
							</div>
							<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${vehiclesAds[i].item_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
						</div>
					</div>
				`;

				if ((added) % 4 === 0) {
					row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
				}

				var myEle = document.getElementById(`${vehiclesAds[i].item_id}`);
				if(!myEle){
					modal += `<div class="modal fade" id="${vehiclesAds[i].item_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${vehiclesAds[i].label} for ${vehiclesAds[i].price}€</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
													<a id="confirmAction" href="#" class="${vehiclesAds[i].item_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
												</div>
											</div>
										</div>
									</div>
								</div>
									`;
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}

			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads available</span>
							</div>
							<div>
								<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
			break
		case 'updateItems':
			selectedWindow = "items";
			$('#page-title').html(`Items`);

			$('#sidebar').html(`
				<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
				<p class="sidebar-item selected" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
				<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
			`);

			$('#sidebar-personal').html(`
				<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
					<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
					<span class="badge bg-danger">${myAds.length}</span>
				</p>
			`);

			itemsAds = event.data.itemsAds;
			var num2 = itemsAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				var string_modal = itemsAds[i].item_id+"_itemToBuy_"+itemsAds[i].id;
				var modal_id = string_modal;
				added++
				row += `
					<div class="col-md-3">
						<div class="card item_card d-flex flex-column">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${itemsAds[i].author_name}</div><div><b>Phone:</b> ${itemsAds[i].phone_number}</div><div><b>Description:</b> ${itemsAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${itemsAds[i].start_date}</span></div>
								<img src="icons/${itemsAds[i].item_id}.png" class="image">
								<div class="item_card-spacer" style="margin-bottom: -50;">
									<div class="item-price text-center">${itemsAds[i].price} €</div>
									<div class="item-title text-center">${itemsAds[i].label} (x${itemsAds[i].amount})</div>
								</div>
							</div>
							<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
						</div>
					</div>
				`;
				if ((added) % 4 === 0) {
					row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
				}

				var myEle = document.getElementById(`${modal_id}`);
				if(!myEle){
					modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${itemsAds[i].label} for ${itemsAds[i].price}€</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
													<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
												</div>
											</div>
										</div>
									</div>
								</div>
					`;
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}
			
			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads available</span>
							</div>
							<div>
								<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
			break
		case 'updateBlackmarket':
			selectedWindow = "blackmarket";
			$('#page-title').html(`Black Market`);

			$('#sidebar').html(`
				<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
				<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
				<p class="sidebar-item selected" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
			`);

			$('#sidebar-personal').html(`
				<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
					<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
					<span class="badge bg-danger">${myAds.length}</span>
				</p>
			`);

			blackmarketAds = event.data.blackmarketAds;
			var num2 = blackmarketAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				var string_modal = blackmarketAds[i].item_id+"_blackmarketToBuy_"+blackmarketAds[i].id;
				var modal_id = string_modal;
				added++
				row += `
					<div class="col-md-3">
						<div class="card item_card d-flex flex-column">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${blackmarketAds[i].author_name}</div><div><b>Phone:</b> ${blackmarketAds[i].phone_number}</div><div><b>Description:</b> ${blackmarketAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${blackmarketAds[i].start_date}</span></div>
								<img src="icons/${blackmarketAds[i].item_id}.png" class="image">
								<div class="item_card-spacer" style="margin-bottom: -50;">
									<div class="item-price text-center">${blackmarketAds[i].price} €</div>
									<div class="item-title text-center">${blackmarketAds[i].label} (x${blackmarketAds[i].amount})</div>
								</div>
							</div>
							<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
						</div>
					</div>
				`;
				if ((added) % 4 === 0) {
					row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
				}

				var myEle = document.getElementById(`${modal_id}`);
				if(!myEle){
					modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${blackmarketAds[i].label} for ${blackmarketAds[i].price}€</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
													<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
												</div>
											</div>
										</div>
									</div>
								</div>
					`;
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}

			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads available</span>
							</div>
							<div>
								<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
			break
		case 'updateMyAds':
			selectedWindow = "myads";
			$('#top-search').html(``);

			$('#page-title').html(`My Advertisements`);

			$('#sidebar').html(`
				<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
				<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
				<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
			`);

			$('#sidebar-personal').html(`
				<p class="sidebar-item mt-2 position-relative selected" id="myads_page" style="margin-bottom: 12px;">
					<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
					<span class="badge bg-danger">${myAds.length}</span>
				</p>
			`);

			myAds = event.data.myAds;
			var num = myAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num; i++) {
				var modal_id = "myAdsSeparator"+myAds[i].item_id+"myAdsSeparator"+myAds[i].id;
				added++
				var img = undefined;
				if (myAds[i].plate) {
					var label = myAds[i].label;
					img = label.replace(/\s/g, '');
				} else {
					img = myAds[i].item_id;
				}
				if(!myAds[i].sold){
					if (myAds[i].amount > 0){
						row += `
							<div class="col-md-3">
								<div class="card item_card">
									<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
										<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
										<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
										<img src="icons/${img}.png" class="image">
										<div class="item_card-spacer">
											<div class="item-price text-center">${myAds[i].price} €</div>
											<div class="item-title text-center">${myAds[i].label} (x${myAds[i].amount})</div>
										</div>
									</div>
									<a id="cancelAd" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-times"></i> CANCEL</a>
								</div>
							</div>
						`;
					} else {
						row += `
							<div class="col-md-3">
								<div class="card item_card">
									<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
										<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
										<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
										<img src="icons/${img}.png" class="image">
										<div class="item_card-spacer">
											<div class="item-price text-center">${myAds[i].price} €</div>
											<div class="item-title text-center">${myAds[i].label}</div>
										</div>
									</div>
									<a id="cancelAd" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-times"></i> CANCEL</a>
								</div>
							</div>
						`;
					}
					
				} else {
					if (myAds[i].amount){
						row += `
							<div class="col-md-3">
								<div class="card item_card">
									<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
										<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
										<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
										<img src="icons/${img}.png" class="image">
										<div class="item_card-spacer">
											<div class="item-price text-center">${myAds[i].price} €</div>
											<div class="item-title text-center">${myAds[i].label} (x${myAds[i].amount})</div>
										</div>
									</div>
									<a id="claimAd" href="#" class="btn btn-green d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-hand-holding-usd"></i> CLAIM</a>
								</div>
							</div>
						`;
					} else {
						row += `
							<div class="col-md-3">
								<div class="card item_card">
									<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
										<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
										<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
										<img src="icons/${img}.png" class="image">
										<div class="item_card-spacer">
											<div class="item-price text-center">${myAds[i].price} €</div>
											<div class="item-title text-center">${myAds[i].label}</div>
										</div>
									</div>
									<a id="claimAd" href="#" class="btn btn-green d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-hand-holding-usd"></i> CLAIM</a>
								</div>
							</div>
						`;
					}
				}

				if ((added) % 4 === 0) {
					row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
				}

				var myEle = document.getElementById(`${modal_id}`);
				if(!myEle){
					if (myAds[i].amount){
						modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${myAds[i].label} (x${myAds[i].amount})</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> NO</a>
													<a id="confirmMyAds" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-check"></i> YES</a>
												</div>
											</div>
										</div>
									</div>
								</div>
						`;	
					} else {
						modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
									<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<div class="text-center">
													<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
												</div>
												<hr>
												<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
												<div class="text-center" style="font-size: 30px; font-weight: 500;">${myAds[i].label}</div>
												<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
													<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> NO</a>
													<a id="confirmMyAds" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-check"></i> YES</a>
												</div>
											</div>
										</div>
									</div>
								</div>
						`;	
					}
					
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}

			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">You currently have no ads on the market</span>
							</div>
						</div>`;
			}

			$('.badge').html(myAds.length);
			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
			break
		case 'updateMyAdsTable':
			myAds = event.data.myAds;
			$('.badge').html(myAds.length);
			break
	}
});

function checkIfEmpty() {
	if (document.getElementById("vehicle_price").value == "" || document.getElementById("dropdown").value == 0) {
		document.getElementById('confirmPlaceAd').disabled = true;
	} else { 
		document.getElementById('confirmPlaceAd').disabled = false;
	}

	if (document.getElementById("item_price").value == "" || document.getElementById("item_quantity").value == "" || document.getElementById("dropdown_items").value == 0) {
		document.getElementById('confirmPlaceAdItems').disabled = true;
	} else { 
		document.getElementById('confirmPlaceAdItems').disabled = false;
	}

	if (document.getElementById("blackmarket_price").value == "" || document.getElementById("blackmarket_quantity").value == "" || document.getElementById("dropdown_blackmarket").value == 0) {
		document.getElementById('confirmPlaceAdBlackmarket').disabled = true;
	} else { 
		document.getElementById('confirmPlaceAdBlackmarket').disabled = false;
	}
}

$(document).on('click', "#confirmPlaceAd", function() {
	var price = $('#vehicle_price').val();
	var desc = $('#vehicle_description').val();
	var veh = $('#dropdown').val();

	if (price > 0 && veh > 0) {
		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "placeAd",
			window: selectedWindow,
			item: vehicles[veh-1],
			price: price,
			desc: desc,
			duration: 0,
		}));
		$('#vehicle_price').val('');
		$('#vehicle_description').val('');
	} else {
		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "missing",
		}));
	}
	
});

$(document).on('click', "#confirmPlaceAdItems", function() {
	var amount = $('#item_quantity').val();
	var price = $('#item_price').val();
	var desc = $('#item_description').val();
	var itemsI = $('#dropdown_items').val();

	if (price > 0 && itemsI > 0 && amount > 0) {
		if (amount <= items[itemsI-1].count){
			$.post('https://okokMarketplace/action', JSON.stringify({
				action: "placeAd",
				window: selectedWindow,
				item: items[itemsI-1],
				amount: amount,
				price: price,
				desc: desc,
				duration: 0,
			}));
			$('#item_quantity').val('');
			$('#item_price').val('');
			$('#item_description').val('');
		} else {
			$.post('https://okokMarketplace/action', JSON.stringify({
				action: "high",
			}));
		}
	} else {
		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "missing",
		}));
	}
	
});

$(document).on('click', "#confirmPlaceAdBlackmarket", function() {
	var price = $('#blackmarket_price').val();
	var desc = $('#blackmarket_description').val();
	var itemsI = $('#dropdown_blackmarket').val();
	var amount = $('#blackmarket_quantity').val();

	if (price > 0 && itemsI > 0 && amount > 0) {
		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "placeAd",
			window: selectedWindow,
			item: blackmarket[itemsI-1],
			amount: amount,
			price: price,
			desc: desc,
			duration: 0,
		}));
		$('#blackmarket_price').val('');
		$('#blackmarket_description').val('');
		$('#blackmarket_quantity').val('');
	} else {
		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "missing",
		}));
	}
	
});

$(document).on('click', "#confirmAction", function() {
	var str = this.className;
	var id = str.split(" ")[0];

	if (selectedWindow == "vehicles"){
		

		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "buyVehicle",
			id: id,
		}));
	} else if (selectedWindow == "items"){
		var id2 = id.split("_itemToBuy_");

		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "buyItem",
			id: id2[1],
			item: id2[0],
		}));
	} else if (selectedWindow == "blackmarket"){
		var id2 = id.split("_blackmarketToBuy_");

		$.post('https://okokMarketplace/action', JSON.stringify({
			action: "buyBlackmarket",
			id: id2[1],
			blackmarket: id2[0],
		}));
	}
});

$(document).on('click', "#newest", function() {
	if (selectedWindow == "vehicles") {
		vehiclesTable.sort(function(a, b){return a.id - b.id});
		vehicles_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalVehicles"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "items") {
		itemsAds.sort(function(a, b){return a.id - b.id});
		items_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalItems"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "blackmarket") {
		blackmarketAds.sort(function(a, b){return a.id - b.id});
		blackmarket_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalBlackmarket"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	}
});

$(document).on('click', "#lowest", function() {
	if (selectedWindow == "vehicles") {
		vehiclesTable.sort(function(a, b){return a.price - b.price});
		vehicles_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item selected" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalVehicles"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "items") {
		itemsAds.sort(function(a, b){return a.price - b.price});
		items_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item selected" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalItems"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "blackmarket") {
		blackmarketAds.sort(function(a, b){return a.price - b.price});
		blackmarket_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item selected" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalBlackmarket"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	}
});

$(document).on('click', "#highest", function() {
	if (selectedWindow == "vehicles") {
		vehiclesTable.sort(function(a, b){return b.price - a.price});
		vehicles_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item selected" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalVehicles"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "items") {
		itemsAds.sort(function(a, b){return b.price - a.price});
		items_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item selected" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalItems"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	} else if (selectedWindow == "blackmarket") {
		blackmarketAds.sort(function(a, b){return b.price - a.price});
		blackmarket_Function();
		$('#top-search').html(`
			<div class="input-group" style="margin-right: 10px;">
				<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
				<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
			</div>
			<div class="btn-group" style="margin-right: 10px;">
				<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
				<ul class="dropdown-menu">
					<li><a class="dropdown-item" id="newest">Newest to Oldest</a></li>
					<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
					<li><a class="dropdown-item selected" id="highest">Highest Price</a></li>
				</ul>
			</div>
			<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
			<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalBlackmarket"><i class="fas fa-plus"></i> Place an Ad</button>
		`);
	}
});

$(document).on('click', "#refreshbtn", function() {
	$.post('https://okokMarketplace/action', JSON.stringify({
		action: "refresh",
		window: selectedWindow,
	}));
});

$(document).on('click', "#refreshbtn2", function() {
	$.post('https://okokMarketplace/action', JSON.stringify({
		action: "refresh",
		window: selectedWindow,
	}));
});

$(document).on('click', "#vehicles_page", function() {
	vehiclesTable.sort(function(a, b){return a.id - b.id});
	vehicles_Function();
});

$(document).on('click', "#items_page", function() {
	itemsAds.sort(function(a, b){return a.id - b.id});
	items_Function();
});

$(document).on('click', "#blackmarket_page", function() {
	blackmarketAds.sort(function(a, b){return a.id - b.id});
	blackmarket_Function();
});

$(document).on('click', "#myads_page", function() {
	myAds_Function();
});

function vehicles_Function() {
	selectedWindow = "vehicles";

	$('#top-search').html(`
		<div class="input-group" style="margin-right: 10px;">
			<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
			<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
		</div>
		<div class="btn-group" style="margin-right: 10px;">
			<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
				<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
				<li><a class="dropdown-item" id="highest">Highest Price</a></li>
			</ul>
		</div>
		<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
		<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalVehicles"><i class="fas fa-plus"></i> Place an Ad</button>
	`);

	$('#page-title').html(`Vehicles`);

	$('#sidebar').html(`
		<p class="sidebar-item mt-2 selected" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
		<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
		<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
	`);

	$('#sidebar-personal').html(`
		<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
			<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
			<span class="badge bg-danger">${myAds.length}</span>
		</p>
	`);

	var vehiclesAds = vehiclesTable;
	var num2 = vehiclesAds.length;
	var added = 0;
	var row = '<div class="row g-2">';
	var modal = '';

	for(var i = 0; i < num2; i++) {
		added++
		var label = vehiclesAds[i].label;
		var img = label.replace(/\s/g, '');
		row += `
			<div class="col-md-3">
				<div class="card item_card d-flex flex-column">
					<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
						<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${vehiclesAds[i].author_name}</div><div><b>Phone:</b> ${vehiclesAds[i].phone_number}</div><div><b>Description:</b> ${vehiclesAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
						<div class="expiration-time"><span><i class="fas fa-clock"></i> ${vehiclesAds[i].start_date}</span></div>
						<img src="icons/${img}.png" class="image">
						<div class="item_card-spacer" style="margin-bottom: -50;">
							<div class="item-price text-center">${vehiclesAds[i].price} €</div>
							<div class="item-title text-center">${vehiclesAds[i].label}</div>
						</div>
					</div>
					<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${vehiclesAds[i].item_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
				</div>
			</div>
		`;

		if ((added) % 4 === 0) {
			row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
		}

		var myEle = document.getElementById(`${vehiclesAds[i].item_id}`);
		if(!myEle){
			modal += `<div class="modal fade" id="${vehiclesAds[i].item_id}" tabindex="-1">
							<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
								<div class="modal-content myinvoices_modal-content">
									<div class="modal-body p-4">
										<div class="text-center">
											<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
										</div>
										<hr>
										<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
										<div class="text-center" style="font-size: 30px; font-weight: 500;">${vehiclesAds[i].label} for ${vehiclesAds[i].price}€</div>
										<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
											<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
											<a id="confirmAction" href="#" class="${vehiclesAds[i].item_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
										</div>
									</div>
								</div>
							</div>
						</div>
			`;
		}
	}

	if (modal != '') {
		$("body").append(modal);
	}

	row += `</div>`;

	if(added == 0) {
		row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
					<div class="d-flex justify-content-center">
						<span class="text-center" id="info-text">There are no ads available</span>
					</div>
					<div>
						<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
					</div>
				</div>`;
	}

	$('.window').html(row);
	$(".card").fadeIn();

	var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
	var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
		return new bootstrap.Popover(popoverTriggerEl)
	})
}

function items_Function() {
	selectedWindow = "items";

	$('#top-search').html(`
		<div class="input-group" style="margin-right: 10px;">
			<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
			<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
		</div>
		<div class="btn-group" style="margin-right: 10px;">
			<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
				<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
				<li><a class="dropdown-item" id="highest">Highest Price</a></li>
			</ul>
		</div>
		<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
		<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalItems"><i class="fas fa-plus"></i> Place an Ad</button>
	`);

	$('#page-title').html(`Items`);

	$('#sidebar').html(`
		<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
		<p class="sidebar-item selected" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
		<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
	`);

	$('#sidebar-personal').html(`
		<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
			<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
			<span class="badge bg-danger">${myAds.length}</span>
		</p>
	`);

	var num = items.length;
	var dropdown = `<option value="0" selected>Select an item</option>`;

	for(var i = 0; i < num; i++) {
		dropdown += `
			<option value="${i+1}">${items[i].label} (${items[i].count})</option>
		`;
	}
	$('#dropdown_items').html(dropdown);

	var num2 = itemsAds.length;
	var added = 0;
	var row = '<div class="row g-2">';
	var modal = '';

	for(var i = 0; i < num2; i++) {
		var string_modal = itemsAds[i].item_id+"_itemToBuy_"+itemsAds[i].id;
		var modal_id = string_modal;
		added++
		row += `
			<div class="col-md-3">
				<div class="card item_card d-flex flex-column">
					<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
						<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${itemsAds[i].author_name}</div><div><b>Phone:</b> ${itemsAds[i].phone_number}</div><div><b>Description:</b> ${itemsAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
						<div class="expiration-time"><span><i class="fas fa-clock"></i> ${itemsAds[i].start_date}</span></div>
						<img src="icons/${itemsAds[i].item_id}.png" class="image">
						<div class="item_card-spacer" style="margin-bottom: -50;">
							<div class="item-price text-center">${itemsAds[i].price} €</div>
							<div class="item-title text-center">${itemsAds[i].label} (x${itemsAds[i].amount})</div>
						</div>
					</div>
					<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
				</div>
			</div>
		`;
		if ((added) % 4 === 0) {
			row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
		}

		var myEle = document.getElementById(`${modal_id}`);
		if(!myEle){
			modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
							<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
								<div class="modal-content myinvoices_modal-content">
									<div class="modal-body p-4">
										<div class="text-center">
											<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
										</div>
										<hr>
										<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
										<div class="text-center" style="font-size: 30px; font-weight: 500;">${itemsAds[i].label} for ${itemsAds[i].price}€</div>
										<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
											<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
											<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
										</div>
									</div>
								</div>
							</div>
						</div>
			`;
		}
	}

	if (modal != '') {
		$("body").append(modal);
	}
	
	row += `</div>`;

	if(added == 0) {
		row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
					<div class="d-flex justify-content-center">
						<span class="text-center" id="info-text">There are no ads available</span>
					</div>
					<div>
						<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
					</div>
				</div>`;
	}

	$('.window').html(row);
	$(".card").fadeIn();

	var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
	var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
		return new bootstrap.Popover(popoverTriggerEl)
	})
}

function blackmarket_Function() {
	selectedWindow = "blackmarket";

	$('#top-search').html(`
		<div class="input-group" style="margin-right: 10px;">
			<input type="search" id="searchbox" class="form-control searchbox" placeholder="Search..." style="margin-right: 1px;">
			<button type="button" id="searchbtn" class="btn btn-blue searchbtn"><i class="fas fa-search"></i></button>
		</div>
		<div class="btn-group" style="margin-right: 10px;">
			<button type="button" class="btn btn-blue dropdown-toggle sortbtn" data-bs-toggle="dropdown" aria-expanded="false">Sort By</button>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item selected" id="newest">Newest to Oldest</a></li>
				<li><a class="dropdown-item" id="lowest">Lowest Price</a></li>
				<li><a class="dropdown-item" id="highest">Highest Price</a></li>
			</ul>
		</div>
		<button type="button" id="refreshbtn" class="btn btn-blue"><i class="fas fa-sync-alt"></i></button>
		<button type="button" id="placeAd" class="btn btn-blue adbtn" data-bs-toggle="modal" data-bs-target="#placeAdModalBlackmarket"><i class="fas fa-plus"></i> Place an Ad</button>
	`);

	$('#page-title').html(`Black Market`);

	$('#sidebar').html(`
		<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
		<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
		<p class="sidebar-item selected" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
	`);

	$('#sidebar-personal').html(`
		<p class="sidebar-item mt-2 position-relative" id="myads_page" style="margin-bottom: 12px;">
			<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
			<span class="badge bg-danger">${myAds.length}</span>
		</p>
	`);

	var num = blackmarket.length;
	var dropdown = `<option value="0" selected>Select an item</option>`;

	for(var i = 0; i < num; i++) {
		dropdown += `
			<option value="${i+1}">${blackmarket[i].label} (${blackmarket[i].count})</option>
		`;
	}
	$('#dropdown_blackmarket').html(dropdown);

	var num2 = blackmarketAds.length;
	var added = 0;
	var row = '<div class="row g-2">';
	var modal = '';

	for(var i = 0; i < num2; i++) {
		var string_modal = blackmarketAds[i].item_id+"_blackmarketToBuy_"+blackmarketAds[i].id;
		var modal_id = string_modal;
		added++
		row += `
			<div class="col-md-3">
				<div class="card item_card d-flex flex-column">
					<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
						<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${blackmarketAds[i].author_name}</div><div><b>Phone:</b> ${blackmarketAds[i].phone_number}</div><div><b>Description:</b> ${blackmarketAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
						<div class="expiration-time"><span><i class="fas fa-clock"></i> ${blackmarketAds[i].start_date}</span></div>
						<img src="icons/${blackmarketAds[i].item_id}.png" class="image">
						<div class="item_card-spacer" style="margin-bottom: -50;">
							<div class="item-price text-center">${blackmarketAds[i].price} €</div>
							<div class="item-title text-center">${blackmarketAds[i].label} (x${blackmarketAds[i].amount})</div>
						</div>
					</div>
					<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
				</div>
			</div>
		`;
		if ((added) % 4 === 0) {
			row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
		}

		var myEle = document.getElementById(`${modal_id}`);
		if(!myEle){
			modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
							<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
								<div class="modal-content myinvoices_modal-content">
									<div class="modal-body p-4">
										<div class="text-center">
											<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
										</div>
										<hr>
										<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
										<div class="text-center" style="font-size: 30px; font-weight: 500;">${blackmarketAds[i].label} for ${blackmarketAds[i].price}€</div>
										<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
											<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
											<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
										</div>
									</div>
								</div>
							</div>
						</div>
			`;
		}
	}

	if (modal != '') {
		$("body").append(modal);
	}

	row += `</div>`;

	if(added == 0) {
		row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
					<div>
						<span class="text-center" id="info-text">There are no ads available</span>
					</div>
					<div>
						<button type="button" id="refreshbtn2" class="btn btn-blue"><i class="fas fa-sync-alt"></i> Refresh</button>
					</div>
				</div>`;
	}

	$('.window').html(row);
	$(".card").fadeIn();

	var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
	var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
		return new bootstrap.Popover(popoverTriggerEl)
	})
}

function myAds_Function() {
  selectedWindow = "myads";

	$('#top-search').html(``);

	$('#page-title').html(`My Advertisements`);

	$('#sidebar').html(`
		<p class="sidebar-item mt-2" id="vehicles_page" style="margin-bottom: 12px;"><i class="fas fa-car"></i> <span class="ms-1">Vehicles</span></p>
		<p class="sidebar-item" id="items_page" style="margin-bottom: 12px;"><i class="fas fa-box"></i> <span class="ms-1">Items</span></p>
		<p class="sidebar-item" id="blackmarket_page" style="margin-bottom: 12px;"><i class="fas fa-user-ninja"></i> <span class="ms-1">Black Market</span></p>
	`);

	$('#sidebar-personal').html(`
		<p class="sidebar-item mt-2 position-relative selected" id="myads_page" style="margin-bottom: 12px;">
			<i class="fas fa-bullhorn"></i> <span class="ms-1">My Ads</span>
			<span class="badge bg-danger">${myAds.length}</span>
		</p>
	`);

	var num = myAds.length;
	var added = 0;
	var row = '<div class="row g-2">';
	var modal = '';

	for(var i = 0; i < num; i++) {
		var modal_id = "myAdsSeparator"+myAds[i].item_id+"myAdsSeparator"+myAds[i].id;
		added++
		var img = undefined;
		if (myAds[i].plate) {
			var label = myAds[i].label;
			img = label.replace(/\s/g, '');
		} else {
			img = myAds[i].item_id;
		}
		

		if(!myAds[i].sold){
			if (myAds[i].amount > 0){
				row += `
					<div class="col-md-3">
						<div class="card item_card">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer">
									<div class="item-price text-center">${myAds[i].price} €</div>
									<div class="item-title text-center">${myAds[i].label} (x${myAds[i].amount})</div>
								</div>
							</div>
							<a id="cancelAd" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-times"></i> CANCEL</a>
						</div>
					</div>
				`;
			} else {
				row += `
					<div class="col-md-3">
						<div class="card item_card">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer">
									<div class="item-price text-center">${myAds[i].price} €</div>
									<div class="item-title text-center">${myAds[i].label}</div>
								</div>
							</div>
							<a id="cancelAd" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-times"></i> CANCEL</a>
						</div>
					</div>
				`;
			}
			
		} else {
			if (myAds[i].amount){
				row += `
					<div class="col-md-3">
						<div class="card item_card">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer">
									<div class="item-price text-center">${myAds[i].price} €</div>
									<div class="item-title text-center">${myAds[i].label} (x${myAds[i].amount})</div>
								</div>
							</div>
							<a id="claimAd" href="#" class="btn btn-green d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-hand-holding-usd"></i> CLAIM</a>
						</div>
					</div>
				`;
			} else {
				row += `
					<div class="col-md-3">
						<div class="card item_card">
							<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
								<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${myAds[i].author_name}</div><div><b>Phone:</b> ${myAds[i].phone_number}</div><div><b>Description:</b> ${myAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
								<div class="expiration-time"><span><i class="fas fa-clock"></i> ${myAds[i].start_date}</span></div>
								<img src="icons/${img}.png" class="image">
								<div class="item_card-spacer">
									<div class="item-price text-center">${myAds[i].price} €</div>
									<div class="item-title text-center">${myAds[i].label}</div>
								</div>
							</div>
							<a id="claimAd" href="#" class="btn btn-green d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-hand-holding-usd"></i> CLAIM</a>
						</div>
					</div>
				`;
			}
		}

		if ((added) % 4 === 0) {
			row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
		}

		var myEle = document.getElementById(`${modal_id}`);
		if(!myEle){
			if (myAds[i].amount){
				modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
							<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
								<div class="modal-content myinvoices_modal-content">
									<div class="modal-body p-4">
										<div class="text-center">
											<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
										</div>
										<hr>
										<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
										<div class="text-center" style="font-size: 30px; font-weight: 500;">${myAds[i].label} (x${myAds[i].amount})</div>
										<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
											<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> NO</a>
											<a id="confirmMyAds" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-check"></i> YES</a>
										</div>
									</div>
								</div>
							</div>
						</div>
				`;	
			} else {
				modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
							<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
								<div class="modal-content myinvoices_modal-content">
									<div class="modal-body p-4">
										<div class="text-center">
											<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
										</div>
										<hr>
										<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
										<div class="text-center" style="font-size: 30px; font-weight: 500;">${myAds[i].label}</div>
										<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
											<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> NO</a>
											<a id="confirmMyAds" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-check"></i> YES</a>
										</div>
									</div>
								</div>
							</div>
						</div>
				`;	
			}
			
		}
	}

	if (modal != '') {
		$("body").append(modal);
	}

	row += `</div>`;

	if(added == 0) {
		row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
					<div class="d-flex justify-content-center">
						<span class="text-center" id="info-text">You currently have no ads on the market</span>
					</div>
				</div>`;
	}

	$('.window').html(row);
	$(".card").fadeIn();

	var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
	var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
		return new bootstrap.Popover(popoverTriggerEl)
	})
}

$(document).on('click', "#confirmMyAds", function() {
	var str = this.className;
	var id = str.split(" ")[0];
	var id2 = id.split("myAdsSeparator");
	var item = undefined;

	var num = myAds.length;

	for(var i = 0; i < num; i++) {
		if(myAds[i].id == id2[2] && myAds[i].item_id == id2[1]) {
			item = myAds[i];
			break;
		}
	}

	$.post('https://okokMarketplace/action', JSON.stringify({
		action: "myAd",
		item: item,
	}));
	
});

$(document).on('click', ".logout", function() {
	$("body").fadeOut();
	$.post('https://okokMarketplace/action', JSON.stringify({
		action: "close",
	}));
	let popovers = document.querySelectorAll('.popover')
	for (let i = 0; i < popovers.length; i++) {
	  bootstrap.Popover.getInstance(popovers[i]).hide()
	}
});

$(document).ready(function() {
	document.onkeyup = function(data) {
		if (data.which == 27) {
			$("body").fadeOut();
			$.post('https://okokMarketplace/action', JSON.stringify({
				action: "close",
			}));
			let popovers = document.querySelectorAll('.popover')
			for (let i = 0; i < popovers.length; i++) {
			  bootstrap.Popover.getInstance(popovers[i]).hide()
			}
		}
	};
});

// SEARCH

$(document).on('click', "#searchbtn", function() {
	var search = $('#searchbox').val();
	search = search.toLowerCase();

	if (search != "") {
		if (selectedWindow == "vehicles") {
			selectedWindow = "vehicles";
			$('#page-title').html(`Vehicles`);
			var vehiclesAds = vehiclesTable;
			var num2 = vehiclesAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				var str = vehiclesAds[i].label;
				str = str.toLowerCase();
				if (str.includes(search)) {
					added++
					var label = vehiclesAds[i].label;
					var img = label.replace(/\s/g, '');
					row += `
						<div class="col-md-3">
							<div class="card item_card d-flex flex-column">
								<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
									<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${vehiclesAds[i].author_name}</div><div><b>Phone:</b> ${vehiclesAds[i].phone_number}</div><div><b>Description:</b> ${vehiclesAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
									<div class="expiration-time"><span><i class="fas fa-clock"></i> ${vehiclesAds[i].start_date}</span></div>
									<img src="icons/${img}.png" class="image">
									<div class="item_card-spacer" style="margin-bottom: -50;">
										<div class="item-price text-center">${vehiclesAds[i].price} €</div>
										<div class="item-title text-center">${vehiclesAds[i].label}</div>
									</div>
								</div>
								<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${vehiclesAds[i].item_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
							</div>
						</div>
					`;

					if ((added) % 4 === 0) {
						row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
					}

					var myEle = document.getElementById(`${vehiclesAds[i].item_id}`);
					if(!myEle){
						modal += `<div class="modal fade" id="${vehiclesAds[i].item_id}" tabindex="-1">
										<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
											<div class="modal-content myinvoices_modal-content">
												<div class="modal-body p-4">
													<div class="text-center">
														<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
													</div>
													<hr>
													<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
													<div class="text-center" style="font-size: 30px; font-weight: 500;">${vehiclesAds[i].label} for ${vehiclesAds[i].price}€</div>
													<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
														<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
														<a id="confirmAction" href="#" class="${vehiclesAds[i].item_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
													</div>
												</div>
											</div>
										</div>
									</div>
										`;
					}
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}
			
			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads that match '${search}'</span>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
		} else if (selectedWindow == "items") {
			selectedWindow = "items";
			$('#page-title').html(`Items`);
			var num2 = itemsAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				var str = itemsAds[i].label;
				str = str.toLowerCase();

				if (str.includes(search)) {
					var string_modal = itemsAds[i].item_id+"_itemToBuy_"+itemsAds[i].id;
					var modal_id = string_modal;
					added++
					row += `
						<div class="col-md-3">
							<div class="card item_card d-flex flex-column">
								<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
									<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${itemsAds[i].author_name}</div><div><b>Phone:</b> ${itemsAds[i].phone_number}</div><div><b>Description:</b> ${itemsAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
									<div class="expiration-time"><span><i class="fas fa-clock"></i> ${itemsAds[i].start_date}</span></div>
									<img src="icons/${itemsAds[i].item_id}.png" class="image">
									<div class="item_card-spacer" style="margin-bottom: -50;">
										<div class="item-price text-center">${itemsAds[i].price} €</div>
										<div class="item-title text-center">${itemsAds[i].label} (x${itemsAds[i].amount})</div>
									</div>
								</div>
								<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
							</div>
						</div>
					`;
					if ((added) % 4 === 0) {
						row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
					}

					var myEle = document.getElementById(`${modal_id}`);
					if(!myEle){
						modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
										<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
											<div class="modal-content myinvoices_modal-content">
												<div class="modal-body p-4">
													<div class="text-center">
														<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
													</div>
													<hr>
													<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
													<div class="text-center" style="font-size: 30px; font-weight: 500;">${itemsAds[i].label} for ${itemsAds[i].price}€</div>
													<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
														<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
														<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
													</div>
												</div>
											</div>
										</div>
									</div>
						`;
					}
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}
			
			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads that match '${search}'</span>+++++++++
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
		} else if (selectedWindow == "blackmarket") {
			selectedWindow = "blackmarket";
			$('#page-title').html(`Black Market`);
			var num2 = blackmarketAds.length;
			var added = 0;
			var row = '<div class="row g-2">';
			var modal = '';

			for(var i = 0; i < num2; i++) {
				var str = blackmarketAds[i].label;
				str = str.toLowerCase();

				if (str.includes(search)) {
					var string_modal = blackmarketAds[i].item_id+"_blackmarketToBuy_"+blackmarketAds[i].id;
					var modal_id = string_modal;
					added++
					row += `
						<div class="col-md-3">
							<div class="card item_card d-flex flex-column">
								<div class="card-body text-center flex-grow-1 d-flex flex-column justify-content-between pb-1 align-items-center">
									<span class="infohover" data-bs-container="body" data-bs-toggle="popover" data-bs-placement="top" data-bs-html="true" data-bs-content="<div><b>Seller:</b> ${blackmarketAds[i].author_name}</div><div><b>Phone:</b> ${blackmarketAds[i].phone_number}</div><div><b>Description:</b> ${blackmarketAds[i].description}</div>" data-bs-trigger="hover"><i class="fas fa-info-circle"></i></span>
									<div class="expiration-time"><span><i class="fas fa-clock"></i> ${blackmarketAds[i].start_date}</span></div>
									<img src="icons/${blackmarketAds[i].item_id}.png" class="image">
									<div class="item_card-spacer" style="margin-bottom: -50;">
										<div class="item-price text-center">${blackmarketAds[i].price} €</div>
										<div class="item-title text-center">${blackmarketAds[i].label} (x${blackmarketAds[i].amount})</div>
									</div>
								</div>
								<a id="buyVehicle" href="#" class="btn btn-blue d-block item_card-btn" data-bs-toggle="modal" data-bs-target="#${modal_id}"><i class="fas fa-shopping-cart"></i> BUY</a>
							</div>
						</div>
					`;
					if ((added) % 4 === 0) {
						row = addStr(row, row.length, `</div><div class="row g-2" style="margin-top: 0px;">`);
					}

					var myEle = document.getElementById(`${modal_id}`);
					if(!myEle){
						modal += `<div class="modal fade" id="${modal_id}" tabindex="-1">
										<div class="modal-dialog modal-lg modal-dialog-centered" style="width: 500px;">
											<div class="modal-content myinvoices_modal-content">
												<div class="modal-body p-4">
													<div class="text-center">
														<span style="font-weight: 600; font-size: 40px; text-align: center;">Are you sure?</span>
													</div>
													<hr>
													<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
													<div class="text-center" style="font-size: 30px; font-weight: 500;">${blackmarketAds[i].label} for ${blackmarketAds[i].price}€</div>
													<div class="d-flex justify-content-center align-items-center" style="margin-top: 10px;">
														<a id="cancelAction" href="#" class="btn btn-dark d-block w-50" style="border-radius: 10px; font-size: 30px; margin-right: 15px;" data-bs-dismiss="modal"><i class="fas fa-times"></i> CANCEL</a>
														<a id="confirmAction" href="#" class="${modal_id} btn btn-blue d-block w-50" style="border-radius: 10px; font-size: 30px;" data-bs-dismiss="modal"><i class="fas fa-shopping-cart"></i> BUY</a>
													</div>
												</div>
											</div>
										</div>
									</div>
						`;
					}
				}
			}

			if (modal != '') {
				$("body").append(modal);
			}

			row += `</div>`;

			if(added == 0) {
				row = `<div class="d-flex justify-content-center align-items-center h-100 flex-column">
							<div class="d-flex justify-content-center">
								<span class="text-center" id="info-text">There are no ads that match '${search}'</span>
							</div>
						</div>`;
			}

			$('.window').html(row);
			$(".card").fadeIn();

			var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
			var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl)
			})
		}
	} else {
		if (selectedWindow == "vehicles") {
			vehicles_Function();
		} else if (selectedWindow == "items") {
			items_Function();
		} else if (selectedWindow == "blackmarket") {
			blackmarket_Function();
		}
	}
	
});