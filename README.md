# Tenants-Maps

At BetaNYC, we have scraped the PDFs listing rent-stabilized units throughout the City put out by the Rent Guidelines Board. We then designed [Tenants Map](https://tenants.beta.nyc/) - a map that displays the location of rent-stabilized units throughout Manhattan. The map separately highlights the properties listed in the Rent Guidelines Board dataset and the NYC tax bill dataset scraped by John Krauss, allowing users to compare the accuracy of the two datasets. When users click on a property, they are provided with additional information about the property owner, the rent-stabilization programs in which the owner participates, and the number of rent-stabilized units in the building from 2007 to 2016. Users can also see the number of housing-related 311 complaints made about the property since 2015 - including those made about heat/hot water, plumbing, paint/plaster, rodents, dirty conditions, and elevators. Finally, users can filter the map to display only the properties in a particular community district. We hope the tool can help buildings where owners are harassing rent-stabilized tenants out of their units to make way for high-rent leases. 

## How to Contribute 
* File an issue via this [repo's issue cue](https://github.com/BetaNYC/Tenants-Maps/issues).
* Request a feature via this [repo's issue cue](https://github.com/BetaNYC/Tenants-Maps/issues).
* Comment on issues. 
* Write code to fix issues or to create new features. When contributing code, please be sure to: 
  * Fork this repository, modify the code (changing only one thing at a time), and then issue a pull request for each change.
  * Follow the project's coding style (using K&R-style indentation and bracketing, commenting above each feature, and using snake case for variables).
  * Test your code locally before issuing a pull request. 
  * Clearly state the purpose of your change in the description field for each commit.

## Architecture
Tenants Map is a landing page that displays a Carto basemap and polygons for each building containing residential units in Manhattan. Data to produce the polygons are stored in shapefiles in Carto and queried on the page load. Units are outlined with a solid black line if they contain rent-stabilized units according to both the Rent Guidelines Board and NYC property tax bills, and outlined with a dashed black line if they contain rent-stabilized units according to either. Units are colored according to the number of housing-related 311 complaints made about the property since 2015. Data about housing-related 311 complaints since 2015 are also stored in Carto (as separate files because of their size). They are joined to the shapefiles along shared BBL fields. 

Clicking on a polygon further queries the datasets stored in Carto for additional information about the selected building's 311 complaints and rent-stabilization status. 311 datasets in Carto are regularly automatically synced with 311 data stored in the NYC Open Data Portal. Searching for a NYC location queries the City's Geoclient API for the geo-coordinates that correspond to the entered address, and the map repositions to this location. Filtering to a community district queries Carto to get the bounds of the district from a shapefile of all NYC community districts; the map filters to only display polygons int this community district and repositions to center around these bounds.

## Backend Services

### carto

Most of the data for Tenants Map is stored in BetaNYC's carto account.
* `table_311_buzzfeed_projmap_after_20180101_1`
  * Dataset of all 311 complaints with housing-related complaint types ('HEAT/HOT WATER', 'PLUMBING', 'PAINT/PLASTER', 'Plumbing', 'Rodent', 'Dirty Conditions', 'General Construction/Plumbing', 'UNSANITARY CONDITIONS', and 'Elevator)' made in Manhattan since the start of 2018
  * [Published](https://data.cityofnewyork.us/Social-Services/311-BuzzFeed-ProjMap-After-20180101/tcea-gv95) as a BetaNYC-filtered view on NYC's Open Data Portal
  * Data is updated in the Open Data Portal daily and synced with BetaNYC's Carto account daily.
* `table_311_buzzfeed_projmap_2017_18_1`
  * Dataset of all 311 complaints with housing-related complaint types made in Manhattan from 2017-2018
  * [Published](https://data.cityofnewyork.us/Social-Services/311-BuzzFeed-ProjMap-2017-18/mz7d-pviy) as a BetaNYC-filtered view on NYC's Open Data Portal
  * Data is updated in the Open Data Portal daily and synced with BetaNYC's Carto account daily.
* `table_311_buzzfeed_projmap_2016_1`
  * Dataset of all 311 complaints with housing-related complaint types made in Manhattan from 2016-2017
  * [Published](https://data.cityofnewyork.us/Social-Services/311-BuzzFeed-ProjMap-2016/73kp-hgxn) as a BetaNYC-filtered view on NYC's Open Data Portal
  * Data is updated in the Open Data Portal daily and synced with BetaNYC's Carto account daily.
* `table_311_buzzfeed_projmap_2015_16_1`
  * Dataset of all 311 complaints with housing-related complaint types made in Manhattan from 2015-2016
  * [Published](https://data.cityofnewyork.us/Social-Services/311-BuzzFeed-ProjMap-2015-16/kgfk-43n8) as a BetaNYC-filtered view on NYC's Open Data Portal
  * Data is updated in the Open Data Portal daily and synced with BetaNYC's Carto account daily.
* `rent_stabilized_plus_tax_data`
  * Dataset created after joining three other datasets: 1) Data about buildings containing rent-stabilized units [scraped](https://github.com/joepope44/nyc_housing) from the [Rent Guidelines Board Rent Stabilized Buildings Lists](https://www1.nyc.gov/site/rentguidelinesboard/resources/rent-stabilized-building-lists.page), 2) [Data](http://taxbills.nyc/) reporting number of rent-stabilized units listed on each NYC building's tax bill by year, 3) Shapefile of NYC lots or [MapPLUTO](https://www1.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page). Each row was joined along the shared BBL field.
  * Join 1: 
  `SELECT row_number() over() as cartodb_id,
				pluto.the_geom as the_geom,
				pluto.the_geom_webmercator,
				rent_pdf.cartodb_id as rent_pdf_cartodb_id,
				rent_pdf.status1,
				rent_pdf.status2,
				rent_pdf.status3,
				rent_pdf.bbl,
				pluto.cartodb_id as pluto_cartodb_id,
				pluto.borough as pluto_borough,
				pluto.cd as pluto_cd,
				pluto.ct2010 as pluto_ct2010,
				pluto.cb2010 as pluto_cb2010,
				pluto.schooldist as pluto_schooldist,
				pluto.council as pluto_council,
				pluto.zipcode as pluto_zipcode,
				pluto.firecomp as pluto_firecomp,
				pluto.policeprct as pluto_policeprct,
				pluto.healthcent as pluto_healthcent,
				pluto.healtharea as pluto_healtharea,
				pluto.sanitdistr as pluto_sanitdistr,
				pluto.address as pluto_address,
				pluto.bldgclass as pluto_bldgclass,
				pluto.ownername as pluto_ownername,
				pluto.numbldgs as pluto_numbldgs,
				pluto.numfloors as pluto_numfloors,
				pluto.unitsres as pluto_unitsres,
				pluto.unitstotal as pluto_unitstotal,
				pluto.yearbuilt as pluto_yearbuilt,
				pluto.yearalter1 as pluto_yearalter1,
				pluto.yearalter2 as pluto_yearalter2,
				pluto.histdist as pluto_histdist,
				pluto.landmark as pluto_landmark,
				pluto.bbl as pluto_bbl
				FROM (SELECT * FROM nyc_pdf_scrape_1) AS rent_pdf
				RIGHT JOIN (SELECT * FROM mnmappluto) AS pluto
				ON rent_pdf.bbl = pluto.bbl`
  * Join 2: 
	`SELECT 
row_number() over() as cartodb_id,
left_source.the_geom as the_geom,
left_source.the_geom_webmercator as the_geom_webmercator, left_source.cartodb_id as rent_stabilized_parcels_cartodb_id, left_source.pluto_policeprct, left_source.rent_pdf_cartodb_id as rent_pdf_cartodb_id, left_source.rent_pdf_status1, left_source.rent_pdf_status2, left_source.rent_pdf_status3, left_source.rent_pdf_bbl, left_source.pluto_cartodb_id as pluto_cartodb_id, left_source.pluto_borough, left_source.pluto_cd, left_source.pluto_ct2010, left_source.pluto_cb2010, left_source.pluto_schooldist, left_source.pluto_council, left_source.pluto_zipcode, left_source.pluto_firecomp, left_source.pluto_healthcent, left_source.pluto_healtharea, left_source.pluto_sanitdistr, left_source.pluto_address, left_source.pluto_bldgclass, left_source.pluto_ownername, left_source.pluto_numbldgs, left_source.pluto_numfloors, left_source.pluto_unitsres, left_source.pluto_unitstotal, left_source.pluto_yearbuilt, left_source.pluto_yearalter1, left_source.pluto_yearalter2, left_source.pluto_histdist, left_source.pluto_landmark, left_source.pluto_bbl, right_source.cartodb_id as krauss_cartodb_id, right_source.ownername as krauss_ownername
FROM
(SELECT * FROM rent_stabilized_parcels_1) AS left_source
LEFT JOIN
(SELECT * FROM john_krauss_tax_data WHERE _2007uc IS NOT NULL OR _2008uc IS NOT NULL OR _2009uc IS NOT NULL OR _2010uc IS NOT NULL OR _2011uc IS NOT NULL OR _2012uc IS NOT NULL OR _2013uc IS NOT NULL OR _2014uc IS NOT NULL OR _2015uc IS NOT NULL OR _2016uc IS NOT NULL) AS right_source
ON left_source.pluto_bbl = right_source.ucbbl`

  * Data is joined in Carto, downloaded, and re-uploaded annually.
* `john_krauss_tax_data`
  * Dataset reporting number of rent-stabilized units listed on each NYC building's tax bill by year. 
  * This dataset is only queried when users click on a property. 
  * [Published](http://taxbills.nyc/) by Civic Hacker John Krauss after he scraped the data for all property tax bills in the City.
  * Data is updated yearly.
* `nycd`
  * Shapefile of all NYC community districts.
  * This dataset is only queried when users select to filter to a community district. Aftering filtering the map to only display lots that are part of the selected community district, the map zooms to the bounds of the polygon representing the selected community district in this shapefile.
  * [Published](https://data.cityofnewyork.us/City-Government/Community-Districts/yfnk-k7r4) by the Department of City Planning 
  * Data is as need in the Open Data Portal. 

  
### Carto.js v4
We use Carto.js to create and style map layers from data stored in the BetaNYC Carto account.
* [Source](https://libs.cartocdn.com/carto.js/v4.1.2/carto.min.js)
* [Documentation](https://carto.com/developers/carto-js/reference/)

### Leaflet.js 
We use leaflet.js for additional JS-based mapping features such as re-centering the map to certain geographic coordinates on a location search and re-centering the map to certain bounds when filtering to a community district.
* [Source](https://unpkg.com/leaflet@1.3.1/dist/leaflet.js)
* [Documentation](https://leafletjs.com/reference-1.3.2.html)

### Chart.js
We use Chart.js to display a pie chart depicting the breakdown of 311 complaints made about a building according to their complaint type and a line chart depicting the number of 311 complaints made per year about a particular building. 
* [Source](https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js)
* [Documentation](http://www.chartjs.org/docs/latest/)

### NYC Geoclient API
When users enter a text address into the location search field, the system queries the Geoclient API for the lat/lon of that location.
* [Source](https://developer.cityofnewyork.us/api/geoclient-api)
* [Documentation](https://api.cityofnewyork.us/geoclient/v1/doc)

### Fetch API
We use the Fetch API for browser-based Web requests to the Carto SQL API and the NYC Geoclient API.
* [Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Change Log

### Tenants Maps v0.6e

* [[1]](../../../../BetaNYC/SLAM/issues/1) The position of the location search bar and the community district filter were swapped.
* [[2]](../../../../BetaNYC/SLAM/issues/1) Instructions and a legend were added to the main infobox.
* [[3]](../../../../BetaNYC/SLAM/issues/3) Data source information was added to the feature click box. 
* [[4]](../../../../BetaNYC/SLAM/issues/4) Exceptions for % change in rent-stabilized since 2007 calculation were caught. 
* [[5]](../../../../BetaNYC/SLAM/issues/5) A reset map link was added to the infobox allowing users to reset the map to its original zoom and position. 
* [[6]](../../../../BetaNYC/SLAM/issues/6) The position of the location search bar and the community district filter were swapped.
* [[7]](../../../../BetaNYC/SLAM/issues/7) The BetaNYC logo was added to the main infobox.
* [[10]](../../../../BetaNYC/SLAM/issues/10) Axis labels were added to the line graphs.

### Initial Commit v0.5

* Users can view all residential Manhattan properties on map, colored according to the number of 311 complaints, and outlined if they contain rent-stabilized units according to the Rent Guidelines Board and NYC tax bills. Parcels that are only listed in one of these datasets are outlined with a dashed line, indicating that the data about whether it contains rent-stabilized units is inconsistent.
* On feature hover, users can view parcel address
* On feature click, users can view parcel information, including - property information, neighborhood information, rent-stabilization status, and breakdown of 311 complaints
* Users can search for Manhattan address and zoom to that location
* Users can filter to display information for just one community district

## Copyrights 

Please see [license](https://github.com/BetaNYC/Tenants-Maps/blob/master/LICENSE) file for details.
 * Non-code, Creative Commons Attribution 4.0
 * Code, GNU General Public License
 
## Have Questions?

Contact [Lindsay Poirier](mailto:lindsay@beta.nyc) and [Noel Hidalgo](mailto:noel@beta.nyc).
