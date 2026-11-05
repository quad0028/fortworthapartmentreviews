/* Area context comes from an explicit service-page CTA, never IP location. */
(function(){
  'use strict';
  var areas={"arlington":"Arlington","burleson-crowley":"Burleson / Crowley","downtown-fort-worth":"Downtown Fort Worth","east-fort-worth":"East Fort Worth","hurst-euless-bedford":"Hurst / Euless / Bedford","mansfield":"Mansfield","north-fort-worth":"North Fort Worth","north-richland-hills":"North Richland Hills","northwest-tarrant-county":"Northwest Tarrant County","west-fort-worth":"West Fort Worth"};
  var slug=new URLSearchParams(window.location.search).get('area');
  if(!Object.prototype.hasOwnProperty.call(areas,slug))return;
  var heading=document.querySelector('[data-form-area-heading]');
  if(heading)heading.textContent="Get Your Free "+areas[slug]+" Apartment List";
})();
