(function($) {

	"use strict";

	const fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// scroll
	const scrollWindow = function () {
		$(window).scroll(function () {
			var $w = $(this),
				st = $w.scrollTop(),
				navbar = $('.ftco_navbar'),
				sd = $('.js-scroll-wrap');

			if (st > 150) {
				if (!navbar.hasClass('scrolled')) {
					navbar.addClass('scrolled');
				}
			}
			if (st < 150) {
				if (navbar.hasClass('scrolled')) {
					navbar.removeClass('scrolled sleep');
				}
			}
			if (st > 350) {
				if (!navbar.hasClass('awake')) {
					navbar.addClass('awake');
				}

				if (sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if (st < 350) {
				if (navbar.hasClass('awake')) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if (sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	const goHere = function () {

		$('.mouse-icon').on('click', function (event) {

			event.preventDefault();

			$('html,body').animate({
				scrollTop: $('.goto-here').offset().top
			}, 500, 'easeInOutExpo');

			return false;
		});
	};

	goHere();

	$('[data-toggle="popover"]').popover();
	$('[data-toggle="tooltip"]').tooltip();

	window.activedownloads = 0;

})(jQuery);


/* RELEVANT TO SPLITUNE*/

$(function() {

  $(".progress").each(function() {

    let value = $(this).attr('data-value');
    let left = $(this).find('.progress-left .progress-bar');
    let right = $(this).find('.progress-right .progress-bar');

    if (value > 0) {
      if (value <= 50) {
        right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)');
      } else {
        right.css('transform', 'rotate(180deg)');
        left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)');
      }
    }

  });

  function percentageToDegrees(percentage) {
  		return percentage / 100 * 360;
  }

});


function selectStem(selectedStem) {
	let newtext;
	let allcomponents = ['Vocals', 'Drums', 'Bass', 'Other', 'Piano'];
	$(".stemoption").each(function() {
	  if($(this).attr('data-stem') == selectedStem){
		newtext = $(this).text();
		$(this).addClass('hide');
	  }else if($(this).hasClass('hide')){
		$(this).removeClass('hide');
	  }
	});
	$("#stemcount").text(newtext)
		.attr('title',allcomponents.slice(0,selectedStem).join(" / ") )
		.attr('data-original-title',allcomponents.slice(0,selectedStem).join(" / ") )
		.attr('original-title',allcomponents.slice(0,selectedStem).join(" / ") )
		.attr('data-stem',selectedStem);
}


function getwavesurfer(elementid){
	var ctx = document.createElement('canvas').getContext('2d');
	var linGrad = ctx.createLinearGradient(0, 64, 0, 200);
	linGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.000)');
	linGrad.addColorStop(0.5, 'rgba(183, 183, 183, 1.000)');
	return WaveSurfer.create({
		container: elementid,
		waveColor: linGrad,
		progressColor: '#ed0cef',
		cursorColor: '#fff',
		barWidth: 2,
		backgroundColor: 'rgba(82, 83, 87, 0.4)',
		barHeight: 0.9,
		height: 50,
		partialRender: true,
		pixelRatio: 1,
		responsive: true,
	});
}


// Download model with progress, fn call to python
function downloadmodel(name){
	$(`#download${name}`).attr("disabled", true);
	$(`#closesettings`).attr("disabled", true);
	$(`#discardSettings`).attr("disabled", true);
	++window.activedownloads;
	$(`#progress${name}`).removeClass('bg-danger');
	$(`#progress${name} span`).text(`${name} model 0% downloaded`);
	eel.download_with_progress(name);

}

// Exposed to python, progress callback
function notifyprogress(name,prog) {
	$(`#progress${name}`).css('width',`${prog}%`);
	if(prog===100){
		$(`#progress${name} span`).text(`${name} model download complete`);
		$(`#progress${name}`).addClass('bg-success');
		window.activedownloads = Math.max(0,window.activedownloads-1);
		if(window.activedownloads===0){
			$(`#closesettings`).attr("disabled", false);
			$(`#discardSettings`).attr("disabled", false);
		}
	}else{
		$(`#progress${name} span`).text(`${name} model ${prog}% downloaded`);
	}
}

// Exposed to python, error callback
function errorOnDownload(name,err){
	alert("Error Downloading: " + err);
	--window.activedownloads;
	if(window.activedownloads===0){
		$(`#closesettings`).attr("disabled", false);
		$(`#discardSettings`).attr("disabled", false);
	}
	$(`#download${name}`).attr("disabled", false);
	$(`#progress${name}`).addClass('bg-danger');
	$(`#progress${name} span`).text(`${name} model Retry Download`);
}


<!-- TODO : ADD NOTIFICATIONS -->
function addNotification(msg, ntype='info'){
	if (!(ntype==='info' || ntype==='success' || ntype==='danger' || ntype==='warning')){
		ntype='info';
	}
	let notifyhtml = `<div class="alert alert-${ntype}"><div class="container"><div class="d-flex"><div class="alert-icon"><i class="ion-ios-information-circle-outline"></i></div><p class="mb-0 ml-2"><b>Alert: </b><span style="color: #000000">${msg}</span></p></div><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="ion-ios-close"></i></span></button></div></div>`;
	$("#notification_area").append(notifyhtml);
}

function alphaDebug(debugMsg){
	console.log(debugMsg);
}



eel.expose(notifyprogress);
eel.expose(errorOnDownload);
eel.expose(addNotification);
eel.expose(alphaDebug);
