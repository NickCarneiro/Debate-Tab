

$(document).ready(function(){
	var count = 0;
	    var jVal = {
	        'first_name' : function() {
	 
            $('body').append('<div id="nameInfo" class="info"></div>');
 
            var nameInfo = $('#nameInfo');
            var ele = $('#first_name');
	            var pos = ele.offset();
	 
            nameInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	 
	            if(ele.val().length < 2) {
	                jVal.errors = true;
	                    nameInfo.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
            } else {
	                    nameInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                    ele.removeClass('wrong').addClass('normal');
	            }
	        },
			
			'last_name' : function() {
	 
            $('body').append('<div id="nameInfo2" class="info"></div>');
 
            var nameInfo2 = $('#nameInfo2');
            var ele = $('#last_name');
	            var pos = ele.offset();
	 
            nameInfo2.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	 
	            if(ele.val().length < 2) {
	                jVal.errors = true;
	                    nameInfo2.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
            } else {
	                    nameInfo2.removeClass('error').addClass('correct').html('&radic;').show();
	                    ele.removeClass('wrong').addClass('normal');
	            }
	        },
			'password' : function() {
	 
            $('body').append('<div id="pw" class="info"></div>');
 
            var pw = $('#pw');
            var ele = $('#password');
	            var pos = ele.offset();
	 
            pw.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	 
	            if(ele.val().length < 6) {
	                jVal.errors = true;
	                    pw.removeClass('correct').addClass('error').html('&larr; at least 6 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
            } else {
	                    pw.removeClass('error').addClass('correct').html('&radic;').show();
	                    ele.removeClass('wrong').addClass('normal');
	            }
	        },
	 
	      
	 
        'email' : function() {
 
	            $('body').append('<div id="emailInfo" class="info"></div>');
	 
            var emailInfo = $('#emailInfo');
	            var ele = $('#email');
	            var pos = ele.offset();
	 
	            emailInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	 
	            var patt = /^.+@.+[.].{2,}$/i;

	            if(!patt.test(ele.val())) {
	                jVal.errors = true;
	                    emailInfo.removeClass('correct').addClass('error').html('&larr; Please provide a valid email').show();
	                    ele.removeClass('normal').addClass('wrong');
	            } else {
	                    emailInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                    ele.removeClass('wrong').addClass('normal');
	            }
	        },
	 
	        'cell_phone' : function() {
	 
	            $('body').append('<div id="aboutInfo" class="info"></div>');
	 
	            var aboutInfo = $('#aboutInfo');
	            var ele = $('#cell_phone');
	            var pos = ele.offset();
	 
	            aboutInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	 
	            if(ele.val().length < 12) {
	                jVal.errors = true;
	                    aboutInfo.removeClass('correct').addClass('error').html('&larr; 10 digits please').show();
	                    ele.removeClass('normal').addClass('wrong').css({'font-weight': 'normal'});
	            } else {
	                    aboutInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                    ele.removeClass('wrong').addClass('normal');
	            }
	        },
	 
	        'sendIt' : function (){
	            if(jVal.errors != true) {
	         //    $('#jform').submit(); 
			//	 $.post( '/register', {email: $('#email').val(), first_name: $('#first_name').val(), last_name: $('#last_name').val(), password: $('#password').val(), cell_phone: $('#cell_phone').val()}); 
	          count = 1;
			 // return true;
			//	$.post( '/register', {email: $('#email').val(), first_name: $('#first_name').val(), last_name: $('#last_name').val(), password: $('#password').val(), cell_phone: $('#cell_phone').val()},
			//	function(data){
			//	alert("Data Loaded: " + data);
			//	});
				
				}
				
				
		   }
			
	    };
	 
	// ====================================================== //
	 //$("#jform").submit(function(event){
	 $('#submit').click(function (event){
			console.log("submit button clicked");
			
			//wtf does the following line do?
	        var obj = $.browser.webkit ? $('body') : $('html');
	        //obj.animate({ scrollTop: $('#jform').offset().top }, 750, function (){
	            /*
	            jVal.errors = false;
	            jVal.first_name();
				jVal.last_name();
				jVal.password();
	            jVal.email();
	            jVal.cell_phone();
			    jVal.sendIt();
			    */
			
	        //});
	        //count is a global variable. this is dangerous and confusing. 
	        // redefine at the top of this function
	        /*
			if (count==0)
			{
				//return false;
				event.preventDefault();
			}
			else
			{
			*/
			//	return true; 
			console.log("post");
				$.post( '/register', {email: $('#email').val(), 
				first_name: $('#first_name').val(), 
				last_name: $('#last_name').val(), 
				password: $('#password').val(), 
				cell_phone: $('#cell_phone').val()}, 
				function(data){

				console.log("server response: " + email);
				$('body').append("hsadfsdfasdfsdfi");
				aboutInfo.removeClass('correct').addClass('error').html('&larr; 127 digits please').show();
				
				}, "json");
				
			//}
			
		  
		 
	    });
		
	    $('#first_name').change(jVal.first_name);
		$('#last_name').change(jVal.last_name);
		$('#password').change(jVal.password);
		$('#email').change(jVal.email);
	    $('#cell_phone').change(jVal.cell_phone);
		
	});
