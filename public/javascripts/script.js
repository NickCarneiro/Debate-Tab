/* Author: 

*/


$(function(){
        $("#submit_button").click(function(){
                //validate input
                var name = $("#name").val();
                var school = $("#school").val();
                var email = $("#email").val();
                if(email.length == 0 || email.length > 400){
                        $("#email_error").text("Invalid email address");
                        return;
                }
                //send to server
                $.post("/", { name: name, school: school, email: email },
                   function(response) {
                                
                                console.log(response);
                                if(response.result == true){
                                        $("#header").text("Thank you!");
                                        $("#form_container").slideUp();
                                        $("#subheader_container").hide();
                                } else {
                                        $("#explanation").text("Sorry! Something went wrong. Please try again later.");
                                }
                   }).error(function(){
                                $("#explanation").text("Sorry! Something went wrong. Please try again later.");
                                $("#form_container").slideUp();
                                $("#header").hide();
                                $("#subheader").hide();
                   });

                
        });
});

