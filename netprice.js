/*!
 * Net Price Calculator v1.0
 * http://www.kettering.edu/
 *
 * Author: James McMillan
 * Copyright 2011, Kettering University
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://en.wikipedia.org/wiki/MIT_License
 * http://en.wikipedia.org/wiki/GNU_General_Public_License
 *
 * Date: Mon Aug l 09:43:22 2011 -0500
 */
(function($){
				Number.prototype.formatMoney = function(c, d, t){
					var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
					return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
				};
		  		$.fn.netPrice = function(options){
					options = $.extend({}, $.fn.netPrice.defaultOptions,options);
					function formatTemplate(){
						var template = $.fn.netPrice.template;
						if(template.indexOf("<EFCFIELD/>")>0){
							template = template.replace(/<EFCFIELD\/>/g, '<input type="text" id="efcValue" name="efcValue" class="netprice_input" value="0"/>');
						}
						if(template.indexOf("<COSTS>")>0 && template.indexOf("</COSTS>") > 0){
							var costs = new Array();
							var startp = template.indexOf("<COSTS>")+ 7;
							var endp = template.indexOf("</COSTS>");
							var lenp = endp - startp;
							var tmp = template.substr(startp,lenp);
							try{
								eval(tmp);
								$.fn.netPrice.costs = costs;
							}catch(e){
								alert('Template Error evaluating Costs' + e);
								return null;
							}
							template = template.substr(0,startp) + template.substr(endp);
						}
						if(template.indexOf("<AWARDS>")>0 && template.indexOf("</AWARDS>") > 0){
								var award = new Array();
								var startp = template.indexOf("<AWARDS>") + 8;
								var endp = template.indexOf("</AWARDS>");
								var lenp = endp - startp;
								var tmp = template.substr(startp,lenp);
								try{
									eval(tmp);
									$.fn.netPrice.awards = award;
								}catch(e){
									alert('Template Error evaluating Awards: ' + e);
									return null;
								}
								template = template.substr(0,startp) + template.substr(endp);								
						}
						if(template.indexOf("<PROFILE>")>0 && template.indexOf("</PROFILE>")>0){
							var profile = new Array();
							var startp = template.indexOf("<PROFILE>") + 9;
							var endp = template.indexOf("</PROFILE>");
							var lenp = endp - startp;
							var tmp = template.substr(startp,lenp);
							try{
								eval(tmp);
							}catch(e){
								alert('Template Error evaluating Profiles: ' + e);
								return null;
							}
							var profileTable = "";
							$.each(profile,function(idx,val){
													profileTable += '<fieldset>'
																	+'<legend><input type="radio" name="profile" id="profile' + val.number + '" value="' + idx + '"' 
																	+ (val.checked?' checked':'') 
																	+ '/>'
																	+ val.name
																	+'</legend>'
																	+'<table cellspacing="0" cellpadding="3" border="0">'
																	+'	<tr>'
																	+'		<th>GPA:</th>'
																	+'		<td>' + val.gpa.min + ' - ' + val.gpa.max + '</td>'
																	+'	</tr>'
																	+'	<tr>'
																	+'		<th>SAT:</th>'
																	+'		<td>' + val.sat.min + ' - ' + val.sat.max + '</td>'
																	+'	</tr>'
																	+'	<tr>'
																	+'		<th>ACT:</th>'
																	+'		<td>' + val.act.min + ' - ' + val.act.max + '</td>'
																	+'	</tr>'
																	+'</table>'
																	+'</fieldset>';
													});
							template = template.substr(0,startp) + profileTable + template.substr(endp);
							template = template.replace(/<PROFILE>/g,'');
							template = template.replace(/<\/PROFILE>/g,'');
							$.fn.netPrice.profile = profile;
						}
						if(template.indexOf("<RESIDENCY>") && template.indexOf("</RESIDENCY")){
							var residency = new Array();
							var startp = template.indexOf("<RESIDENCY>") + 11;
							var endp = template.indexOf("</RESIDENCY>");
							var lenp = endp - startp;
							var tmp = template.substr(startp,lenp);
							eval(tmp);
							var residencyTable = "";
							$.each(residency,function(idx,val){
													  	residencyTable += '<input type="radio" name="residency" id="' + val.id + '" value="' + val.value + '"' + (val.checked?' checked':'') + '/> ' + val.label + '<br/>';
													  });
							$.fn.netPrice.residency = residency;
							template = template.substr(0,startp) + residencyTable + template.substr(endp);
							template = template.replace(/<RESIDENCY>/g,'');
							template = template.replace(/<\/RESIDENCY>/g,'');
						}
						$.fn.netPrice.template = template;
					}
					this.each(function(){
									   var element = $(this);
									   $('<div id="netprice_container"></div>').appendTo(element);
									   $.get(options.templateURL,null,function(data){
																						$.fn.netPrice.template = data; 
																						formatTemplate();$("#netprice_container").html($.fn.netPrice.template)
																						$("#efcValue").change(function(){
																													   	$.fn.netPrice.update();
																													   });
																						$("input:radio[name=residency]").click(function(){
																														$.fn.netPrice.update();
																							   });
																						$("input:radio[name=profile]").click(function(){
																														 $.fn.netPrice.update();
																																	  	
																																	  });
																						$.fn.netPrice.update();
																						$(".netprice_slide").hide();
																						$('#netprice_slide' + $.fn.netPrice.currentSlide).show();
																					});
					});
				};
				$.fn.netPrice.currentSlide = 0;
				$.fn.netPrice.gotoSlide = function(idx){
					var slides = $(".netprice_slide");
					var currentidx = $.fn.netPrice.currentSlide;
					if(currentidx != idx && idx > -1 && idx < slides.length){
						$(slides[currentidx]).hide();
						$(slides[idx]).show();	
						$.fn.netPrice.currentSlide = idx;
					}
					return $.fn.netPrice;
				}
				$.fn.netPrice.nextSlide = function(){
					var currentidx = $.fn.netPrice.currentSlide;
					var nextidx = currentidx + 1;
					var slides = $(".netprice_slide");
					if(nextidx < slides.length){
						$.fn.netPrice.gotoSlide(nextidx);
					}
					return $.fn.netPrice;
				}
				$.fn.netPrice.previousSlide = function(){
					var currentidx = $.fn.netPrice.currentSlide;
					var previdx = currentidx - 1;
					if(previdx >= 0){
						$.fn.netPrice.gotoSlide(previdx);	
					}
					return $.fn.netPrice;
				}
				$.fn.netPrice.defaultOptions = {
					templateURL:'template.txt',
					currencyFormat:function(val){
						return '$' + (parseFloat(val)).formatMoney(2,'.',',');	
					}
				};
				$.fn.netPrice.costs = new Array();
				$.fn.netPrice.awards = new Array();
				$.fn.netPrice.profile = new Array();
				$.fn.netPrice.residency = new Array();
				$.fn.netPrice.totalAward = 0;
				$.fn.netPrice.totalCost = 0;
				$.fn.netPrice.template = '';
				$.fn.netPrice.costByCode = function(_code){
						var _retval = new Array();
						for(var i=0;i<$.fn.netPrice.costs.length;i++){
							var o = $.fn.netPrice.costs[i];
							if(o.code == _code){
								_retval.push(o);	
							}
						}
						return _retval;
				}
				$.fn.netPrice.totalByCode = function(_code){
					var _retval = 0;
					var _arr = $.fn.netPrice.costByCode(_code)
					for(var i=0;i<_arr.length;i++){
						_retval += parseFloat(_arr[i].cost);
					}
					return _retval;
				}
				$.fn.netPrice.getCost = function(_type,_code){
					var retval = {};
					var _arr = $.fn.netPrice.costByCode(_code);
					$.each(_arr,function(idx,val){
										 if(val.name == _type){
											retval = val; 
										 }										 
					});
					return retval;
				}
				$.fn.netPrice.getResidency = function(code){
					var arr = $.fn.netPrice.residency;
					var vreturn = {};
					$.each(arr,function(idx,val){
											if(val.value == code){
												vreturn = val;	
											}
										});
					return vreturn;
				}
				$.fn.netPrice.updateResidencyLabel = function(){
					var residency = $.fn.netPrice.getResidency($('input:radio[name=residency]:checked').val());
					$("RESIDENCYLABEL").html(residency.label);
					return $.fn.netPrice;
				}
				$.fn.netPrice.updateCOA = function(){
					var residency = $('input:radio[name=residency]:checked').val();
					var costs = $.fn.netPrice.costByCode(residency);
					var totalCosts = $.fn.netPrice.totalByCode(residency)
					var costTable = '<table cellspacing="0" cellpadding="3" border="0" class="costTable" style="width:100%">';
					$.each(costs,function(idx,val){
												  	costTable += '<tr>'
																+'	<th style="width:49%"><span class="cost_name" onclick="$(\'#cost-desc-' + idx + '\').toggle()">' + val.label + '</span>'
																+'		<div class="cost_description" style="display:none" id="cost-desc-' + idx + '"><p>' + val.description + '</p></div>'
																+' 	</th>'
																+'	<td style="width:49%" class="cost-value">' + $.fn.netPrice.defaultOptions.currencyFormat(val.cost) + '</td>'
																+'</tr>';
												  });
							costTable += "<tr><th>Total cost of Attendance</th><td class=\"cost-total\"><COA>" + $.fn.netPrice.defaultOptions.currencyFormat(totalCosts) + "</COA></td></tr>"
										+"</table>";
						$("COSTS").html(costTable);
						$.fn.netPrice.totalCost = totalCosts;
						return this;
				}
				$.fn.netPrice.updateNeed = function(){
					var retval = 0;
					var efc = $("#efcValue").val();
					var residency = $.fn.netPrice.getResidency($('input:radio[name=residency]:checked').val());
					var coa = $.fn.netPrice.totalByCode(residency.value);
					var needTable = '<table cellspacing="0" cellpadding="3" border="0" class="need-table" style="width:100%">'
									+'<tr>'
									+'	<th style="width:49%">Total Cost of Attendance</th>'
									+'	<td style="width:49%" class="cost-value">' + $.fn.netPrice.defaultOptions.currencyFormat(coa) + '</td>'
									+'</tr>'
									+'<tr>'
									+'	<th>Expected Family Contribution (EFC)</th>'
									+'	<td class="cost-value">' + $.fn.netPrice.defaultOptions.currencyFormat(efc) + '</td>'
									+'</tr>'
									+'<tr>'
									+'	<th>Need</th>'
									+'	<td class="cost-total"><NEED>' + $.fn.netPrice.defaultOptions.currencyFormat(coa - efc) + '</NEED></td>'
									+'</tr>'
									+'</table>';
					$("NEED").html(needTable);
					return $.fn.netPrice;
				}
				$.fn.netPrice.updateProfileLabel = function(){
					var idx = $("input:radio[name=profile]:checked").val();
					$("PROFILELABEL").html($.fn.netPrice.profile[idx].name);
					return $.fn.netPrice;
				}
				$.fn.netPrice.updateAward = function(){
					var efc = $("#efcValue").val();
					var profile = $.fn.netPrice.profile[$("input:radio[name=profile]:checked").val()].number;
					var residency = $('input:radio[name=residency]:checked').val();
					var awardTable = '<table cellspacing="0" cellpadding="3" border="0" class="award-table" style="width:100%">';
					var totalAward = 0;
					$.each($.fn.netPrice.awards,function(idx,val){
														 	var amt = val.rule(efc,profile,residency)
															totalAward += parseFloat(amt);
														 	awardTable += '<tr>'
																		  +'	<th style="width:49%">' 
																		  +'<span class="award_name" onclick="$(\'#award-desc-' + idx + '\').toggle()">' + val.name + '</span>'
																		  +'		<div class="award_description" style="display:none" id="award-desc-' + idx + '"><p>' + val.description + '</p></div>'
																		  + '</th>'
																		  +'	<td class="cost-value" style="width:49%">' + $.fn.netPrice.defaultOptions.currencyFormat(amt) + '</td>'
																		  +'</tr>'
														 });
					awardTable += '<tr><th>Total Estimated Award</th><td class="cost-total"><AWARDTOTAL>' + $.fn.netPrice.defaultOptions.currencyFormat(totalAward) + '<AWARDTOTAL></td></tr>'
								+'</table>';
					$("AWARDS").html(awardTable);
					$.fn.netPrice.totalAward = totalAward;
					return $.fn.netPrice;
				}
				$.fn.netPrice.updateEFCValue = function(){
						$("EFCVALUE").html($.fn.netPrice.defaultOptions.currencyFormat(parseFloat($("#efcValue").val())));
						return $.fn.netPrice;
				}
				$.fn.netPrice.updateNetPrice = function(){
						var coa = parseFloat($.fn.netPrice.totalCost);
						var awardvalue = parseFloat($.fn.netPrice.totalAward);
						var price = $.fn.netPrice.defaultOptions.currencyFormat(coa - awardvalue);
						$("NETPRICE").html(price);
						$("TOTAL").html($.fn.netPrice.defaultOptions.currencyFormat(coa));
						$("AWARDTOTAL").html($.fn.netPrice.defaultOptions.currencyFormat(awardvalue));
						return $.fn.netPrice;
				}
				$.fn.netPrice.update = function(){
					$.fn.netPrice.updateEFCValue().updateResidencyLabel().updateProfileLabel().updateCOA().updateNeed().updateAward().updateNetPrice();
					return $.fn.netPrice;
				}
				
})(jQuery);