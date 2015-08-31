(function(){

	//helper function for our AJAX call
	function ktof(kelvin){
		return (kelvin - 273.15) * 1.8;
	};

	//Cache references to the dom elements we will need more than once. It is best practice to prefix
	//all variables which are initialized to the return value of a jQuery function with the '$', which
	//indicates that these vars have access to jQuery methods.
	var $tintVal = $("#user-tint-val"); //Using the '#' finds the element with the specified ID.
	var $tintForm = $("#form-change-tint");
	var $bgTint = $("#bg-tint");

	var $textVal = $("#user-text");
	var $liForm = $("#form-new-li");
	//When we give jQuery a string, it returns an array containing all of the elements with that tag.
	//We only want the first (only extract elements from a jQuery object when you KNOW where they will
	//be in the array).
	var ul = $("ul")[0];

	var $ajaxLink = $("#ajax-link");
	var $weatherBox = $("#weather-box");

	// 1) MANIPULATING DOM ELEMENTS

	//First, we set up a listener with the 'on' function. The first arg is a string representing the 
	//type of event, and the second is a callback function to be executed when the event occurs.
	$tintForm.on("submit", function(event){ //Note that we pass the 'event' arg. 
		event.preventDefault(); //It is always a good idea to prevent the default action that may occur

		//'val' is a getter/setter which returns a string representing the value of the element. As is the case
		//with most jQuery functions, the no-argument version is a getter, whereas providing an argument
		//will set the value of the element, which is not what we want here. Note this doesn't check
		//for empty/blank strings...
		var newTintColor = $tintVal.val();

		//If the new color contains only numbers, we prepend a '#' to make CSS happy
		if (/^\d+$/.test(newTintColor)){
			newTintColor = '#' + newTintColor;
		};

		//The 'css' method takes an object whose keys are css prorties, and their
		//corresponding values. Here we are taking the value of the input box and setting that to
		//the new background color of $bgTint. We could also get this value from the 'event' object
		//that was passed in, but I find this way more straightforward.
		$bgTint.css({"background-color": newTintColor});

		$tintVal.val(""); //clear out the input box
	});

	// 2) ADDING NEW ELEMENTS TO THE DOM

	//Whenever the user tries to submit their post, we want to intervene:
	$liForm.on("submit", function(event){
		event.preventDefault();

		var newText = $textVal.val();

		//This is a tricky part of jQuery syntax: when we give a string with <brackets>, jQuery will
		//CREATE a new jQuery DOM element. Without the brackets, it will simply return an array containing
		//all of the 'li' elements in the DOM.
		var $li = $("<li>");

		//Here we use 'text' as a setter. Note that this will also sanitize input.
		$li.text(newText);

		//Since 'ul' is a node pulled out of a jQuery array, we need to wrap it with the jQuery object to
		//give it back the methods it needs. The 'append' method will insert the argument as a child element
		//of the caller, after all existing children. 'prepend' does the same thing, except BEFORE any 
		//existing children.
		$(ul).append($li);

		$textVal.val(""); //clear out the input box
	})

	// 3) USING AJAX

	//Trigger the callback whenever someone clicks on a link.
	$ajaxLink.on("click", function(event){
		//Here is it important to prevent the default event, since otherwise the link will cause us to 
		//leave the page!
		event.preventDefault()

		//Inform the user we are waiting for a response
		$weatherBox.text("Loading...");

		//Make the AJAX call, passing in an object containing instructions
		$.ajax({
			url: "http://api.openweathermap.org/data/2.5/weather?zip=10012,us", //where to send request
			method: "GET", //HTTP method ('GET is default, so this is unnecessary in practice')
			success: function(data, status, jqXHR){ //callback if the server sends a positive response

				//build up a string with info from the served data (this particular API responds with
				//JSON, so no parsing is necessary)
				var weatherStr = "<table><tr><th>The Weather in " + data.name + ":</th></tr>" + 
												 "<tr><td>" + (Math.floor(ktof(data.main.temp)) + 32) + "&deg;F</td></tr>" + 
												 "<tr><td>" + data.weather[0].description + "</td></tr></table";
				//Unlike the 'text' function, the 'html' function does NOT sanitize input, but it allows
				//a string representation of DOM elements to be created and added as children of the caller.
				//Be careful with the 'html' function, as it will overwrite ALL existing children of the 
				//caller
				$weatherBox.html(weatherStr);
			},
			error: function(data, status, errInfo){ //callback if the server responds with an error
				$weatherBox.text("Oops, something went wrong :/")
			}
		});
	});
})();