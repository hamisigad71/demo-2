function getURLVar(key) {
	var value = [];

	var query = String(document.location).split('?');

	if (query[1]) {
		var part = query[1].split('&');

		for (i = 0; i < part.length; i++) {
			var data = part[i].split('=');

			if (data[0] && data[1]) {
				value[data[0]] = data[1];
			}
		}

		if (value[key]) {
			return value[key];
		} else {
			return '';
		}
	}
}

$(document).ready(function() {
	
    $('body').on('click', '.modal-link', function(e) {
		e.preventDefault();
        var element = this;
        $('#modal-information').remove();
        $.ajax({
            url: $(element).attr('href'),
			dataType: 'html',
            success: function(html) {                
			    $('body').append(html);
                $('#modal-information').modal('show');
            }
		});
    });	
	
	$('#shopping-cart').on('submit', 'form', function (e) {
		setTimeout(function() { 
			$('#cart  .total-shopping-cart ').load('index.php?route=common/cart|info #cart .total-shopping-cart');
			$('#cart > ul').load('index.php?route=common/cart|info ul li');		
		}, 1000);
	});	
	
	// Highlight any found errors
	$('.text-danger').each(function() {
		var element = $(this).parent().parent();
		
		if (element.hasClass('form-group')) {
			element.addClass('has-error');
		}
	});
		
	// Currency
    $('#form-currency .dropdown-item').on('click', function (e) {
        e.preventDefault();

        $('#form-currency input[name=\'code\']').val($(this).attr('href'));

        $('#form-currency').submit();
    });

	// Language
	$('#form-language .language-select').on('click', function(e) {
		e.preventDefault();

		$('#form-language input[name=\'code\']').val($(this).attr('name'));

		$('#form-language').submit();
	});

	/* Search */
	$('#search input[name=\'search\']').parent().find('button').on('click', function() {
		var url = $('base').attr('href') + 'index.php?route=product/search';

		var value = $('header #search input[name=\'search\']').val();

		if (value) {
			url += '&search=' + encodeURIComponent(value);
		}

		location = url;
	});

	$('#search input[name=\'search\']').on('keydown', function(e) {
		if (e.keyCode == 13) {
			$('header #search input[name=\'search\']').parent().find('button').trigger('click');
		}
	});

	// Menu
	$('#menu .dropdown-menu').each(function() {
		var menu = $('#menu').offset();
		var dropdown = $(this).parent().offset();

		var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#menu').outerWidth());

		if (i > 0) {
			$(this).css('margin-left', '-' + (i + 5) + 'px');
		}
	});

	// Checkout
	$(document).on('keydown', '#collapse-checkout-option input[name=\'email\'], #collapse-checkout-option input[name=\'password\']', function(e) {
		if (e.keyCode == 13) {
			$('#collapse-checkout-option #button-login').trigger('click');
		}
	});
	
	// tooltips on hover
	//$('[data-bs-toggle=\'tooltip\']').tooltip({container: 'body'});

	    // Hide tooltip when clicking on it
        var hasTooltip = $('[data-bs-toggle=\'tooltip\']').tooltip({container: 'body'});     

        $('[data-bs-toggle=\'tooltip\']').hover(

    		function() {},

    		function(e) {$('[data-bs-toggle=\'tooltip\']').tooltip('hide');}

        );

	// Makes tooltips work on ajax generated content
	$(document).ajaxStop(function() {
		$('[data-bs-toggle=\'tooltip\']').tooltip({container: 'body'});
	});
	
	/*addTocart Loading Effect*/
	$('.addToCart').on('click', function(e) {$(this).addClass('loading');});
});


var timer;
var cart = {
	'add': function(product_id, quantity) {
		$.ajax({
			url: 'index.php?route=extension/so_theme/soconfig/cart|add&language='+$('body').attr('data-lang'),
			type: 'post',
			data: 'product_id=' + product_id + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				
				clearTimeout(timer);
				if (json['redirect']) {
					location = json['redirect'];
				}
				if (json['info']) {
						$('#wrapper').before('<div class="alert alert-info"><i class="fa fa-info-circle"></i> ' + json['info'] + '<button type="button" class="fa fa-close close"></button></div>');
				}

				if (json['success']) {
					/*Leader custom code*/
					$('#previewModal').modal('show'); 
					$('#previewModal .modal-body').load('index.php?route=extension/so_theme/soconfig/cart|info&language='+$("body").attr("data-lang")+'&product_id='+ product_id);
					/*End Leader custom code*/
					
					$('#cart  .total-shopping-cart ').load('index.php?route=common/cart|info #cart .total-shopping-cart');
					$('#cart > ul').load('index.php?route=common/cart|info ul li');
					$('.so-groups-sticky .popup-mycart .popup-content').load('index.php?route=extension/so_theme/module/so_tools|info .popup-content .cart-header');			
                    
                    $('#wrapper').before('<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="fa fa-close close" data-bs-dismiss="alert"></button></div>');					
					
					$('.addToCart').removeClass('loading');
					timer = setTimeout(function () {
						$('.alert').addClass('fadeOut');
					}, 4000);
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'update': function(key, quantity) {
		$.ajax({
			url: 'index.php?route=checkout/cart/edit',
			type: 'post',
			data: 'key=' + key + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				$('.alert').remove();
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart  .total-shopping-cart ').html(json['total'] );
					$('.alert').addClass('fadeOut');
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart  .total-shopping-cart ').load('index.php?route=common/cart|info #cart .total-shopping-cart');
					$('#cart > ul').load('index.php?route=common/cart|info ul li');
					$('.so-groups-sticky .popup-mycart .popup-content').load('index.php?route=extension/so_theme/module/so_tools|info .popup-content .cart-header');
				}
				
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function(key) {
		$.ajax({
			url: 'index.php?route=checkout/cart|remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart .total-shopping-cart ').html(json['total'] );
				}, 100);
					
				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart  .total-shopping-cart ').load('index.php?route=common/cart|info #cart .total-shopping-cart');
					$('#cart > ul').load('index.php?route=common/cart|info ul li');
					$('.so-groups-sticky .popup-mycart .popup-content').load('index.php?route=extension/so_theme/module/so_tools|info .popup-content .cart-header');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var voucher = {
	'add': function() {},
	'remove': function(key) {
		$.ajax({
			url: 'index.php?route=checkout/cart|remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart > ul').load('index.php?route=common/cart|info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var wishlist = {
	'add': function(product_id) {
		$.ajax({
			url: 'index.php?route=extension/so_theme/soconfig/wishlist|add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function(json) {
                $('.alert').remove();
				clearTimeout(timer);
                if (json['redirect']) {
                    location = json['redirect'];
                }
                if (json['success']) {
                    $('#wrapper').before('<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="fa fa-close close" data-bs-dismiss="alert"></button></div>');
                }
                if (json['info']) {
                    $('#wrapper').before('<div class="alert alert-info"><i class="fa fa-info-circle"></i> ' + json['info'] + '<button type="button" class="fa fa-close close"></button></div>');
                }
                $('#wishlist-total').html(json['total']);
				$('#wishlist-total').attr('title', json['total']);
                timer = setTimeout(function() {
                    $('.alert').addClass('fadeOut');
                }, 4000);
            },
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var compare = {
	'add': function(product_id) {
		$.ajax({
			url: 'index.php?route=extension/so_theme/soconfig/compare|add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			 success: function(json) {
                $('.alert').remove();
				clearTimeout(timer);
                if (json['info']) {
                    $('#wrapper').before('<div class="alert alert-info"><i class="fa fa-info-circle"></i>  ' + json['info'] + '<button type="button" class="fa fa-close close"></button></div>');
                }
                if (json['success']) {
                    $('#wrapper').before('<div class="alert alert-success"><i class="fa fa-check-circle"></i>' + json['success'] + '<button type="button" class="fa fa-close close"></button></div>');
                    if (json['warning']) {
                        $('.alert').append('<div class="alert alert-warning"><i class="fa fa-exclamation-circle"></i> ' + json['warning'] + '<button type="button" class="fa fa-close close"></button></div>');
                    }
                    $('#compare-total').html(json['total']);
                }
                timer = setTimeout(function() {
                    $('.alert').addClass('fadeOut');
                }, 4000);
            },
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
	
}


/* Agree to Terms */
$(document).delegate('.agree', 'click', function(e) {
	e.preventDefault();
	$('#modal-agree').remove();

	var element = this;
	$.ajax({
		url: $(element).attr('href'),
		type: 'get',
		dataType: 'html',
		success: function(data) {
			html  = '<div id="modal-agree" class="modal">';
			html += '  <div class="modal-dialog">';
			html += '    <div class="modal-content">';
			html += '      <div class="modal-header">';
			html += '        <button type="button" class="close" data-bs-dismiss="modal" aria-hidden="true"></button>';
			html += '        <h4 class="modal-title">' + $(element).text() + '</h4>';
			html += '      </div>';
			html += '      <div class="modal-body">' + data + '</div>';
			html += '    </div';
			html += '  </div>';
			html += '</div>';

			$('body').append(html);

			$('#modal-agree').modal('show');	
		}
	});
});

// Autocomplete */
(function($) {
	$.fn.autocomplete = function(option) {
		return this.each(function() {
			this.timer = null;
			this.items = new Array();

			$.extend(this, option);

			$(this).attr('autocomplete', 'off');

			// Focus
			$(this).on('focus', function() {
				this.request();
			});

			// Blur
			$(this).on('blur', function() {
				setTimeout(function(object) {
					object.hide();
				}, 200, this);
			});

			// Keydown
			$(this).on('keydown', function(event) {
				switch(event.keyCode) {
					case 27: // escape
						this.hide();
						break;
					default:
						this.request();
						break;
				}
			});

			// Click
			this.click = function(event) {
				event.preventDefault();
				value = $(event.target).parent().attr('data-value');
				if (value && this.items[value]) {
					this.select(this.items[value]);
				}
			}




			// Show
			this.show = function() {
				var pos = $(this).position();
				$(this).siblings('ul.dropdown-menu').css({
					top: pos.top + $(this).outerHeight(),
					left: pos.left
				});
				$(this).siblings('ul.dropdown-menu').show();
			}

			// Hide
			this.hide = function() {
				$(this).siblings('ul.dropdown-menu').hide();
			}

			// Request
			this.request = function() {
				clearTimeout(this.timer);

				this.timer = setTimeout(function(object) {
					object.source($(object).val(), $.proxy(object.response, object));
				}, 200, this);
			}

			// Response
			this.response = function(json) {
				html = '';

				if (json.length) {
					for (i = 0; i < json.length; i++) {
						this.items[json[i]['value']] = json[i];
					}


					for (i = 0; i < json.length; i++) {
						if (!json[i]['category']) {
							html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
						}
					}

					// Get all the ones with a categories
					var category = new Array();


					for (i = 0; i < json.length; i++) {
						if (json[i]['category']) {
							if (!category[json[i]['category']]) {
								category[json[i]['category']] = new Array();
								category[json[i]['category']]['name'] = json[i]['category'];
								category[json[i]['category']]['item'] = new Array();
							}

							category[json[i]['category']]['item'].push(json[i]);

						}
					}

					for (i in category) {
						html += '<li class="dropdown-header">' + category[i]['name'] + '</li>';

						for (j = 0; j < category[i]['item'].length; j++) {
							html += '<li data-value="' + category[i]['item'][j]['value'] + '"><a href="#">&nbsp;&nbsp;&nbsp;' + category[i]['item'][j]['label'] + '</a></li>';
						}

					}
				}

				if (html) {
					this.show();
				} else {
					this.hide();


				}
				$(this).siblings('ul.dropdown-menu').html(html);
			}

			$(this).after('<ul class="dropdown-menu"></ul>');
			$(this).siblings('ul.dropdown-menu').delegate('a', 'click', $.proxy(this.click, this));
		});
	}
})(window.jQuery);

// Chain ajax calls.
class Chain {
    constructor() {
        this.start = false;
        this.data = [];
    }

    attach(call) {
        this.data.push(call);

        if (!this.start) {
            this.execute();
        }
    }

    execute() {
        if (this.data.length) {
            this.start = true;

            var call = this.data.shift();

            var jqxhr = call();

            jqxhr.done(function() {
                chain.execute();
            });
        } else {
            this.start = false;
        }
    }
}

// Forms
$(document).on('submit', 'form[data-oc-toggle=\'ajax\']', function (e) {
    e.preventDefault();

    var element = this;

    var form = e.target;

    var action = $(form).attr('action');

    var button = e.originalEvent.submitter;

    var formaction = $(button).attr('formaction');

    if (formaction !== undefined) {
        action = formaction;
    }

    var method = $(form).attr('method');

    if (method === undefined) {
        method = 'post';
    }

    var enctype = $(element).attr('enctype');

    if (enctype === undefined) {
        enctype = 'application/x-www-form-urlencoded';
    }

    // https://github.com/opencart/opencart/issues/9690
    if (typeof CKEDITOR != 'undefined') {
        for (instance in CKEDITOR.instances) {
            CKEDITOR.instances[instance].updateElement();
        }
    }

    $.ajax({
        url: action,
        type: method,
        data: $(form).serialize(),
        dataType: 'json',
        cache: false,
        contentType: enctype,
        processData: false,
        beforeSend: function () {
            $(button).prop('disabled', true).addClass('loading');
        },
        complete: function () {
           $(button).prop('disabled', false).removeClass('loading');
        },
        success: function (json) {
            $('.alert-dismissible').remove();
            $(form).find('.is-invalid').removeClass('is-invalid');
            $(form).find('.invalid-feedback').removeClass('d-block');

            if (json['redirect']) {
                location = json['redirect'];
            }

            if (typeof json['error'] == 'string') {
                $('#alert').prepend('<div class="alert alert-danger alert-dismissible"><i class="fas fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
            }

            if (typeof json['error'] == 'object') {
                if (json['error']['warning']) {
                    $('#alert').prepend('<div class="alert alert-danger alert-dismissible"><i class="fas fa-exclamation-circle"></i> ' + json['error']['warning'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
                }

                for (key in json['error']) {
                    $('#input-' + key.replaceAll('_', '-')).addClass('is-invalid').find('.form-control, .form-select, .form-check-input, .form-check-label').addClass('is-invalid');
                    $('#error-' + key.replaceAll('_', '-')).html(json['error'][key]).addClass('d-block');
                }
            }

            if (json['success']) {
                $('#alert').prepend('<div class="alert alert-success alert-dismissible"><i class="fas fa-exclamation-circle"></i> ' + json['success'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');

                // Refresh
                var url = $(form).attr('data-oc-load');
                var target = $(form).attr('data-oc-target');

                if (url !== undefined && target !== undefined) {
                    $(target).load(url);
                }
				
				$('#cart  .total-shopping-cart ').load('index.php?route=common/cart|info #cart .total-shopping-cart');
				$('#cart > ul').load('index.php?route=common/cart|info ul li');
				$('.so-groups-sticky .popup-mycart .popup-content').load('index.php?route=extension/so_theme/module/so_tools|info .popup-content .cart-header');					
            }

            // Replace any form values that correspond to form names.
            for (key in json) {
                $(form).find('[name=\'' + key + '\']').val(json[key]);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
});

var chain = new Chain();

// Autocomplete
(function($) {
    $.fn.autocomplete = function(option) {
        return this.each(function() {
            var $this = $(this);
            var $dropdown = $('#' + $this.attr('list'));

            this.timer = null;
            this.items = [];

            $.extend(this, option);

            // Focus
            $this.on('focus', function() {
                this.request();
            });

            // Keydown
            $this.on('input', function(e) {
                this.request();

                var value = $this.val();

                if (value && this.items[value]) {
                    this.select(this.items[value]);
                }
            });

            // Request
            this.request = function() {
                clearTimeout(this.timer);

                this.timer = setTimeout(function(object) {
                    object.source($(object).val(), $.proxy(object.response, object));
                }, 50, this);
            }

            // Response
            this.response = function(json) {
                var html = '';
                var category = {};
                var name;
                var i = 0, j = 0;

                if (json.length) {
                    for (i = 0; i < json.length; i++) {
                        // update element items
                        this.items[json[i]['label']] = json[i];

                        if (!json[i]['category']) {
                            // ungrouped items
                            html += '<option>' + json[i]['label'] + '</option>';
                        } else {
                            // grouped items
                            name = json[i]['category'];

                            if (!category[name]) {
                                category[name] = [];
                            }

                            category[name].push(json[i]);
                        }
                    }

                    for (name in category) {
                        for (j = 0; j < category[name].length; j++) {
                            html += '<option value="' + category[name][j]['label'] + '">' + name + '</option>';
                        }
                    }
                }

                $dropdown.html(html);
            }
        });
    }
})(window.jQuery);