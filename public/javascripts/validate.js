

$(document).ready(function(){
	
		$('#first_name').keyup(function (event){
	
		$('body').append('<div id="nameInfo" class="info"></div>');
 
           	var nameInfo = $('#nameInfo');
           	var ele = $('#first_name');
	        var pos = ele.offset();
	 
         	nameInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkfirstName($('#first_name').val());
		if(msg === true) 
		{

			nameInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
		

			    nameInfo.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
		
		$('#last_name').keyup(function (event){
	
		
		$('body').append('<div id="nameInfo2" class="info"></div>');
 
           	var nameInfo2 = $('#nameInfo2');
           	var ele = $('#last_name');
	        var pos = ele.offset();
	 
         	nameInfo2.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkLastName($('#last_name').val());
		if(msg === true) 
		{

			nameInfo2.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
			

			    nameInfo2.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
		
		$('#email').keyup(function (event){
	
		
		$('body').append('<div id="emailInfo" class="info"></div>');
 
           	var emailInfo = $('#emailInfo');
           	var ele = $('#email');
	        var pos = ele.offset();
	 
         	emailInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkEmail($('#email').val());
		if(msg === true) 
		{

			emailInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{

			    emailInfo.removeClass('correct').addClass('error').html('&larr; Invalid email').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
		
		$('#cell_phone').keyup(function (event){
	
		
		$('body').append('<div id="aboutInfo" class="info"></div>');
 
           	var aboutInfo = $('#aboutInfo');
           	var ele = $('#cell_phone');
	        var pos = ele.offset();
	 
         	aboutInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkPhone($('#cell_phone').val());
		if(msg === true) 
		{

			aboutInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
		

			    aboutInfo.removeClass('correct').addClass('error').html('&larr; at least 10 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
		
		
		$('#password').keyup(function (event){
	
		
		$('body').append('<div id="pw" class="info"></div>');
 
           	var pw = $('#pw');
           	var ele = $('#password');
	        var pos = ele.offset();
	 
         	pw.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkPassword($('#password').val());
		if(msg === true) 
		{

			pw.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
		

			     pw.removeClass('correct').addClass('error').html('&larr; at least 6 characters').show();
	                 ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
		
		$('#cpassword').keyup(function (event){
	
		var password = $('#password').val();
		
		$('body').append('<div id="pw2" class="info"></div>');
 
           	var pw2 = $('#pw2');
           	var ele = $('#cpassword');
	        var pos = ele.offset();
	 
         	pw2.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
	    

		var msg = checkConfirmPassword($('#cpassword').val(), password);
		if(msg === true) 
		{

			pw2.removeClass('error').addClass('correct').html('&larr; Match!').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
		
			     pw2.removeClass('correct').addClass('error').html('&larr; password mismatch').show();
	                 ele.removeClass('normal').addClass('wrong');
			
		}
			
	    });
	 
	// ====================================================== //
	
	    $('#submit').click(function (event){
	
		var error = 0;
	        
	    var fname = $('#first_name').val();
		var lname = $('#last_name').val();
		var email = $('#email').val();
		var password = $('#password').val();
		var cpassword = $('#cpassword').val();
		var phone = $('#cell_phone').val();
			
		
 			$('body').append('<div id="emailInfo" class="info"></div>');
	 
          	   	 var emailInfo = $('#emailInfo');
	           	 var ele = $('#email');
	          	 var pos = ele.offset();
	 
	          	 emailInfo.css({
	                 top: pos.top-3,
	                 left: pos.left+ele.width()+15
	            });

		var msg = checkEmail(email);
		if(msg === true) 
		{

			emailInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
				
			emailInfo.removeClass('correct').addClass('error').html('&larr; Please provide a valid email').show();
	                ele.removeClass('normal').addClass('wrong');

			
		}


		$('body').append('<div id="nameInfo" class="info"></div>');
 
           		 var nameInfo = $('#nameInfo');
           		 var ele = $('#first_name');
	        	 var pos = ele.offset();
	 
         	nameInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });

		var msg = checkfirstName(fname);
		if(msg === true) 
		{

			nameInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
			 error++;

			    nameInfo.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}



		$('body').append('<div id="nameInfo2" class="info"></div>');
 
         		var nameInfo2 = $('#nameInfo2');
         		var ele = $('#last_name');
	    	        var pos = ele.offset();
	 
        	 nameInfo2.css({
	 	        top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });

		var msg = checkLastName(lname);
		if(msg === true) 
		{
			nameInfo2.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;

			    nameInfo2.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	            ele.removeClass('normal').addClass('wrong');

			
		}

		

		$('body').append('<div id="pw" class="info"></div>');
 
            var pw = $('#pw');
           	var ele = $('#password');
	        var pos = ele.offset();
	 
            	pw.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });


		var msg = checkPassword(password);
		if(msg === true) 
		{

			pw.removeClass('error').addClass('correct').html('&radic;').show();
	        ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
	
			 pw.removeClass('correct').addClass('error').html('&larr; at least 6 characters').show();
	         ele.removeClass('normal').addClass('wrong');

			
		}
		
		$('body').append('<div id="pw2" class="info"></div>');
 
            var pw2 = $('#pw2');
           	var ele = $('#cpassword');
	        var pos = ele.offset();
	 
            	pw2.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });


		var msg = checkConfirmPassword(cpassword, password);
		if(msg === true) 
		{

			pw2.removeClass('error').addClass('correct').html('&larr; Match!').show();
	        ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
	
			 pw2.removeClass('correct').addClass('error').html('&larr; password mismatch').show();
	         ele.removeClass('normal').addClass('wrong');

			
		}


			
		$('body').append('<div id="aboutInfo" class="info"></div>');
	 
	            var aboutInfo = $('#aboutInfo');
	            var ele = $('#cell_phone');
	            var pos = ele.offset();
	 
	            aboutInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
		

		var msg = checkPhone(phone);
		if(msg === true) 
		{
			aboutInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
	
			   aboutInfo.removeClass('correct').addClass('error').html('&larr; 10 digits please').show();
	                   ele.removeClass('normal').addClass('wrong').css({'font-weight': 'normal'});

			
		}

		if (error == 0)
		{

				$.post( '/register', {email: $('#email').val(), 
				first_name: $('#first_name').val(), 
				last_name: $('#last_name').val(), 
				password: $('#password').val(), 
				cell_phone: $('#cell_phone').val()}, 
				function(data){
				
				console.log("server response: " + data);
				
				if(data == null)
				{
				//	$('body').append($('#email').val() + " already exists");
					
					$('body').append('<div id="emailInfo" class="info"></div>');
 
					var emailInfo = $('#emailInfo');
					var ele = $('#email');
					var pos = ele.offset();
	 
            	emailInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
					

					emailInfo.removeClass('correct').addClass('error').html('&larr; Email exists already!').show();
					ele.removeClass('normal').addClass('wrong');
				}
				
				else
				{
					console.log("success?");
					window.location.href = "/dashboard";
				}
				
				}, "json");

		}



 
		 
	    });
		
		$('#addMember').click(function (event){
	
		var error = 0;
	        
	    var fname = $('#first_name').val();
		var lname = $('#last_name').val();
		var email = $('#email').val();
		var phone = $('#cell_phone').val();
			
		
 			$('body').append('<div id="emailInfo" class="info"></div>');
	 
          	   	 var emailInfo = $('#emailInfo');
	           	 var ele = $('#email');
	          	 var pos = ele.offset();
	 
	          	 emailInfo.css({
	                 top: pos.top-3,
	                 left: pos.left+ele.width()+15
	            });

		var msg = checkEmail(email);
		if(msg === true) 
		{

			emailInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
				
			emailInfo.removeClass('correct').addClass('error').html('&larr; Please provide a valid email').show();
	                ele.removeClass('normal').addClass('wrong');

			
		}


		$('body').append('<div id="nameInfo" class="info"></div>');
 
           		 var nameInfo = $('#nameInfo');
           		 var ele = $('#first_name');
	        	 var pos = ele.offset();
	 
         	nameInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });

		var msg = checkfirstName(fname);
		if(msg === true) 
		{

			nameInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');
		}

		else
		{
			 error++;

			    nameInfo.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	                    ele.removeClass('normal').addClass('wrong');
			
		}



		$('body').append('<div id="nameInfo2" class="info"></div>');
 
         		var nameInfo2 = $('#nameInfo2');
         		var ele = $('#last_name');
	    	        var pos = ele.offset();
	 
        	 nameInfo2.css({
	 	        top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });

		var msg = checkLastName(lname);
		if(msg === true) 
		{
			nameInfo2.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;

			    nameInfo2.removeClass('correct').addClass('error').html('&larr; at least 2 characters').show();
	            ele.removeClass('normal').addClass('wrong');

			
		}


			
		$('body').append('<div id="aboutInfo" class="info"></div>');
	 
	            var aboutInfo = $('#aboutInfo');
	            var ele = $('#cell_phone');
	            var pos = ele.offset();
	 
	            aboutInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });
		

		var msg = checkPhone(phone);
		if(msg === true) 
		{
			aboutInfo.removeClass('error').addClass('correct').html('&radic;').show();
	                ele.removeClass('wrong').addClass('normal');

		}

		else
		{
			 error++;
	
			   aboutInfo.removeClass('correct').addClass('error').html('&larr; 10 digits please').show();
	                   ele.removeClass('normal').addClass('wrong').css({'font-weight': 'normal'});

			
		}

		if (error == 0)
		{

				$.post( '/createTeam', {email: $('#email').val(), 
				first_name: $('#first_name').val(), 
				last_name: $('#last_name').val(), 
				cell_phone: $('#cell_phone').val()}, 
				function(data){
				
				console.log("server response: " + data.email);
				
				if(data == null)
				{
				//	$('body').append($('#email').val() + " already exists");
					
					$('body').append('<div id="emailInfo" class="info"></div>');
 
					var emailInfo = $('#emailInfo');
					var ele = $('#email');
					var pos = ele.offset();
	 
            	emailInfo.css({
	                top: pos.top-3,
	                left: pos.left+ele.width()+15
	            });

					emailInfo.removeClass('correct').addClass('error').html('&larr; Email exists already!').show();
					ele.removeClass('normal').addClass('wrong');
				}
				
				else
				{
					console.log("success?");
					console.log(data.email);
					$('body').append(data.first_name + " " + data.last_name);
					//window.location.href = "/dashboard";
				}
				
				}, "json");

		}



 
		 
	    });



});
		
	 	function checkfirstName(fname)
		{
			if(fname.length < 2) 
				{
	               			 return "at least 2 characters";
				}
			else
				{
					return true;
				}


		}
		function checkLastName(lname)
		{
			if(lname.length < 2) 
				{
	               			 return "at least 2 characters";
				}
			else
				{
					return true;
				}


		}
		function checkPassword(password)
		{
			if(password.length < 6) 
				{
	               			 return "at least 6 characters";
				}
			else
				{
					return true;
				}


		}
		
		function checkConfirmPassword(cpassword, password)
		{
			if(cpassword == password) 
				{
	               			 return true;
				}
			else
				{
					return "password mismatch";
				}


		}
		function checkEmail(email)
		{
			var patt = /^.+@.+[.].{2,}$/i;

	            if(!patt.test(email))
				{
	               			 return "invalid Email";
				}
			else
				{
					return true;
				}


		}
		function checkPhone(phone)
		{
			if(phone.length < 10) 
				{
	               			 return "at least 10 characters";
				}
			else
				{
					return true;
				}


		}


		
	
