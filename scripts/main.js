
//Filters
function reset_map() {
	//restore the map to the original query and set view to original
	source_rent.setQuery(`WITH 
	o AS (
		(SELECT bbl, COUNT(*) number_complaints
		FROM   table_311_buzzfeed_projmap_after_20180101_1 GROUP BY bbl)
		UNION
		(SELECT bbl, COUNT(*) number_complaints
		FROM   table_311_buzzfeed_projmap_2017_18_1
		GROUP BY bbl)
		UNION
		(SELECT bbl, COUNT(*) number_complaints
		FROM   table_311_buzzfeed_projmap_2016_1
		GROUP BY bbl)
		UNION
		(SELECT bbl, COUNT(*) number_complaints
		FROM   table_311_buzzfeed_projmap_2015_16_1
		GROUP BY bbl)
	),
	m AS (
		SELECT bbl, SUM(number_complaints) complaints
		FROM o
		GROUP BY bbl
	)
	SELECT right_source.cartodb_id cartodb_id, right_source.the_geom_webmercator the_geom_webmercator, m.complaints, right_source.pluto_bbl, right_source.pluto_policeprct, right_source.rent_pdf_cartodb_id, right_source.rent_pdf_status1, right_source.rent_pdf_status2, right_source.rent_pdf_status3, right_source.pluto_cd, right_source.pluto_council, right_source.pluto_zipcode, right_source.pluto_firecomp, right_source.pluto_address, right_source.pluto_ownername, right_source.pluto_numfloors, right_source.pluto_unitsres, right_source.pluto_unitstotal, right_source.pluto_yearbuilt, right_source.pluto_histdist, right_source.pluto_landmark, right_source.krauss_cartodb_id, right_source.pluto_schooldist
	FROM m 
	RIGHT JOIN rent_stabilized_plus_tax_data AS right_source
	ON right_source.pluto_bbl = m.bbl
	WHERE right_source.pluto_unitsres > 0`);
	map.setView([40.73, -74], 15);
}

function filter_map(filter) {
		//inputs a string with the end of an SQL WHERE statement (e.g. "AND [key] = [value]") and resets the data source to this filtered data
		source_rent.setQuery(`WITH
		o AS (
			(SELECT bbl, COUNT(*) number_complaints
			FROM   table_311_buzzfeed_projmap_after_20180101_1 GROUP BY bbl)
			UNION
			(SELECT bbl, COUNT(*) number_complaints
			FROM   table_311_buzzfeed_projmap_2017_18_1
			GROUP BY bbl)
			UNION
			(SELECT bbl, COUNT(*) number_complaints
			FROM   table_311_buzzfeed_projmap_2016_1
			GROUP BY bbl)
			UNION
			(SELECT bbl, COUNT(*) number_complaints
			FROM   table_311_buzzfeed_projmap_2015_16_1
			GROUP BY bbl)
		),
		m AS (
			SELECT bbl, SUM(number_complaints) complaints
			FROM o
			GROUP BY bbl
		)
		SELECT right_source.cartodb_id cartodb_id, right_source.the_geom_webmercator the_geom_webmercator, m.complaints, right_source.pluto_bbl, right_source.pluto_policeprct, right_source.rent_pdf_cartodb_id, right_source.rent_pdf_status1, right_source.rent_pdf_status2, right_source.rent_pdf_status3, right_source.pluto_cd, right_source.pluto_council, right_source.pluto_zipcode, right_source.pluto_firecomp, right_source.pluto_address, right_source.pluto_ownername, right_source.pluto_numfloors, right_source.pluto_unitsres, right_source.pluto_unitstotal, right_source.pluto_yearbuilt, right_source.pluto_histdist, right_source.pluto_landmark, right_source.krauss_cartodb_id, right_source.pluto_schooldist
		FROM m 
		RIGHT JOIN rent_stabilized_plus_tax_data AS right_source
		ON right_source.pluto_bbl = m.bbl
		WHERE right_source.pluto_unitsres > 0`+ filter);
}

//Map Zooms and Fits
function set_cd() {
	//selects the community district users select from the dropdown, queries a file in carto with the shapes of each community district, and fits the map to the extents of that boundary
	
	var select = document.getElementById("community_district");
	var cd = select.options[select.selectedIndex].value;
	
	//filter map to just data in this community district
	var cd_filter = " AND right_source.pluto_cd = "+cd;
	filter_map(cd_filter);
	
	//query CD shapefile stored in carto to get the geographic extents of this community district
	var url_cd = "https://betanyc.carto.com/api/v2/sql/?q=SELECT ST_Extent(the_geom) FROM nycd WHERE borocd="+cd+"&api_key="+api_key;
	fetch(url_cd)
	.then(response => {
		return response.json()
	 })
	.then(json => {
	  const extent = json.rows[0].st_extent;
	  const bounds = parseExtent(extent);
	  //fit map to community district bounds
	  map.fitBounds(
		[
		  [bounds.south, bounds.west],
		  [bounds.north, bounds.east]
		]
	  );
	});
}

function parseExtent(extent) {
	//takes the extent returned from querying the ST_Extent from a carto shapefile, and returns it in a format that is amenable to the .fitBounds leaflet option
	const floatRegex = /-?[0-9]\d*(\.\d+)?/g;
	const matches = extent.match(floatRegex);
	return {
	  west: Number.parseFloat(matches[0]),
	  south: Number.parseFloat(matches[1]),
	  east: Number.parseFloat(matches[2]),
	  north: Number.parseFloat(matches[3])
	};
}

function set_address() {
	//Use the City's Geoclient API to search for an address
	var boro = "Manhattan"
	var adr = document.getElementById("address").value;
	
	//adds CORS header to proxy request getting around errors
	const proxyurl = "https://cors-anywhere.herokuapp.com/";
	
	//query the City's geoclient API
	var url = "https://api.cityofnewyork.us/geoclient/v1/search.json?input=" + " " + adr + " " + boro + "&app_id=dd37f663&app_key=c99663c5e8b11315279f8d28ef245dab";
	
	fetch(proxyurl + url, {mode: 'cors'})
	.then(function(response) {
		return response.json();
	})
	.then(function(address) {
		document.getElementById('no_results').style.display = 'none';
		results = address.results;
		response = results[0].response;
		latitude = response.latitude;
		longitude = response.longitude;
		//set map view to the resulting lat, lon and zoom to 18
		map.setView([latitude, longitude], 18);
	})
	.catch(function(error) {
		//if nothing gets returned, display no results
		document.getElementById('no_results').style.display = 'block';
	});
}

//Displays
function toggle_visibility(id) {
	//toggle the visibility of a selected element
	var e = document.getElementById(id);
	if(e.style.display == 'block')
		e.style.display = 'none';
	else
		e.style.display = 'block';
}

function show_info_box() {
	//show the info box when a user clicks on a feature
	if (document.getElementById('info_box').style.display = 'none')
		document.getElementById('info_box').style.display = 'block';
}

//Charts
function clear_311_charts() {
	//clear 311 charts so that they don't appear as white boxes in the info-box
	if (typeof complaint_chart !== 'undefined'){
		complaint_chart.clear();
		document.getElementById("complaint_type_chart").style.display = 'none';
	}
	if (typeof year_chart !== 'undefined'){
		year_chart.clear();
		document.getElementById("complaint_year_chart").style.display = 'none';
	}
}

function clear_rent_charts() {
	//clear rent chart so that it doesn't appear as a white box in the info-box
	if (typeof units_year_chart !== 'undefined'){
		units_year_chart.clear();
		document.getElementById("units_chart").style.display = 'none';
	}
}




