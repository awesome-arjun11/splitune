 /*AOS.init({
 	duration: 800,
 	easing: 'slide'
 });
*/
(function($) {

	"use strict";


	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();


	// scroll
	var scrollWindow = function() {
		$(window).scroll(function(){
			var $w = $(this),
					st = $w.scrollTop(),
					navbar = $('.ftco_navbar'),
					sd = $('.js-scroll-wrap');

			if (st > 150) {
				if ( !navbar.hasClass('scrolled') ) {
					navbar.addClass('scrolled');	
				}
			} 
			if (st < 150) {
				if ( navbar.hasClass('scrolled') ) {
					navbar.removeClass('scrolled sleep');
				}
			} 
			if ( st > 350 ) {
				if ( !navbar.hasClass('awake') ) {
					navbar.addClass('awake');	
				}
				
				if(sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if ( st < 350 ) {
				if ( navbar.hasClass('awake') ) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if(sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	


	var goHere = function() {

		$('.mouse-icon').on('click', function(event){
			
			event.preventDefault();

			$('html,body').animate({
				scrollTop: $('.goto-here').offset().top
			}, 500, 'easeInOutExpo');
			
			return false;
		});
	};
	goHere();


	$('[data-toggle="popover"]').popover()
	$('[data-toggle="tooltip"]').tooltip()



})(jQuery);


/* RELEVENT TO SPLITUNE*/
$(function() {

  $(".progress").each(function() {

    var value = $(this).attr('data-value');
    var left = $(this).find('.progress-left .progress-bar');
    var right = $(this).find('.progress-right .progress-bar');

    if (value > 0) {
      if (value <= 50) {
        right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
      } else {
        right.css('transform', 'rotate(180deg)')
        left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)')
      }
    }

  })

  function percentageToDegrees(percentage) {

    return percentage / 100 * 360

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
	$("#stemcount").text(newtext);
	$("#stemcount").attr('title',allcomponents.slice(0,selectedStem).join(" / ") );
	$("#stemcount").attr('original-title',allcomponents.slice(0,selectedStem).join(" / ") );
	$("#stemcount").attr('data-stem',selectedStem);
  
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
	});

}
