# Tenants-Maps

At BetaNYC, we have scraped the PDFs listing rent-stabilized units throughout the City put out by the Rent Guidelines Board. We then designed Tenants Map - a map that displays the location of rent-stabilized units throughout Manhattan. The map separately highlights the properties listed in the Rent Guidelines Board dataset and the NYC tax bill dataset scraped by John Krauss, allowing users to compare the accuracy of the two datasets. When users click on a property, they are provided with additional information about the property owner, the rent-stabilization programs in which the owner participates, and the number of rent-stabilized units in the building from 2007 to 2016. Users can also see the number of housing-related 311 complaints made about the property since 2015 - including those made about heat/hot water, plumbing, paint/plaster, rodents, dirty conditions, and elevators. Finally, users can filter the map to display only the properties in a particular community district. We hope the tool can help buildings where owners are harassing rent-stabilized tenants out of their units to make way for high-rent leases. 

## File an Issue 
We're tracking all issues via this [repo's issue cue](https://github.com/BetaNYC/Tenants-Maps/issues).

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

* Users can view all residential Manhattan properties on map, colored according to the number of 311 complaints
* On feature hover, users can view parcel address
* On feature click, users can view parcel information, including - property information, neighborhood information, rent-stabilization status, and breakdown of 311 complaints
* Users can search for Manhattan address and zoom to that location
* Users can filter to display information for just one community district

## Copyrights 

Please see [license] file for details.
 * Non-code, Creative Commons Attribution 4.0
 * Code, GNU General Public License
