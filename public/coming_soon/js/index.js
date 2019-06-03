// INITIALIZATION ********************************

// pre-nav dimensions *********
function nNavigate() {
  const nA = $(window).height() / 2;
  nB = $(window).width() / 2;
  nRadius = Math.sqrt(nA * nA + nB * nB);
  nDiameter = 2 * nRadius;

  $('#Navigate').css({
    width: nDiameter,
    height: nDiameter,
    'margin-top': -nRadius,
    'margin-left': -nRadius
  });
}
nNavigate();

// pre-nav onload *********
$(window).on('load', function() {
  // preload
  $('#Preloader')
    .delay(500)
    .fadeOut(2000);

  // loadfade
  setTimeout(function() {
    $('.loadfade').css({opacity: '1'});
  }, 1000);

  // navigate
  $('.navigate').click(function(e) {
    e.preventDefault();
    const href = $(this).attr('href');

    $('#Navigate').css({transform: 'scale(1)', opacity: '1'});
    $('#NavigateOverlay')
      .add('#LoaderContainer')
      .css({display: 'block'})
      .animate({opacity: 1}, 500);

    setTimeout(function() {
      window.location = href;
    }, 800);
  });

  // resize
  $(window).on('resize', function() {
    nNavigate();
  });
});

// PRIMARY CONTROLS ********************************
$(document).ready(function() {
  // initialization *********
  let done = true,
    timeout;

  // click function *********
  $('.primary-control').click(function() {
    if ($(window).width() > 900) {
      if (done) {
        const thisDisplay = $('#' + $(this).attr('id') + 'Display'),
          notThis = $('.primary-control-display').not(thisDisplay);

        if (notThis.css('opacity') > 0) {
          clearTimeout(timeout);
        }

        animateDisplay(notThis, 0);

        if (thisDisplay.css('opacity') === '0') {
          animateDisplay(thisDisplay, 1);
          timeout = setTimeout(function() {
            animateDisplay(thisDisplay, 0);
            doneUtil();
          }, 7000);
        } else {
          animateDisplay(thisDisplay, 0);
          clearTimeout(timeout);
        }

        doneUtil();
      }
    } else {
      if ($(this).attr('id') === 'PrimaryCall') {
        window.location.href = 'tel:99988877766';
      } else if ($(this).attr('id') === 'PrimaryEmail') {
        window.location.href = 'mailto:support@onlycompgaming.com';
      }
    }
  });

  // animate display *********
  function animateDisplay(elem, val) {
    elem.css({opacity: val});
  }

  // done *********
  function doneUtil() {
    done = false;
    setTimeout(function() {
      done = true;
    }, 1000);
  }
});

// COUNTDOWN *****************************************
$(document).ready(function() {
  // date *********
  const date = new Date('July 7, 2019').getTime();

  // interval *********
  const interval = setInterval(function() {
    // initialization
    const current = new Date().getTime(),
      distance = date - current,
      d = Math.floor(distance / (1000 * 60 * 60 * 24)),
      h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      s = Math.floor((distance % (1000 * 60)) / 1000);

    // display
    display('#One', d);
    display('#Two', h);
    display('#Three', m);
    display('#Four', s);

    // function
    function display(a, b) {
      const sec = $('#CountdownSection ' + a + ' .num');

      b >= 10 ? sec.text(b) : sec.text('0' + b);
    }
  }, 1000);
});

// TYPEWRITER ********************************
$(document).ready(function() {
  // initialization *********
  const elem = document.getElementById('TypewriterText'),
    typewriter = new Typewriter(elem, {
      loop: true,
      cursorClassName: 'typewritercursor'
    });

  // typewriter *********
  typewriter
    .pauseFor(2500)
    .typeString('Coming Soon.')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Only Comp Gaming.')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Innovative eSports.')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Competitive Tournaments.')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Win Cash.')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Win Prizes.')
    .pauseFor(2500)
    .start();
});

// WELCOME FORM ****************************************
$(document).ready(function() {
  // initialization *********
  let i = 0,
    progress = 0,
    nSubmit = false;

  // validation *********
  $('#WelcomeForm').click(function(e) {
    e.preventDefault();

    // init
    const header = $('#WelcomeForm #Header'),
      formButton = $('#WelcomeForm button'),
      success = $('#WelcomeForm #Success'),
      nameVal = $('#FN')
        .val()
        .trim(),
      emailVal = $('#EA')
        .val()
        .trim(),
      stateVal = $('#ST')
        .val()
        .trim(),
      testLength = new RegExp(/^.{2,}/),
      testEmail = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,4}$/);

    // header
    if (!nSubmit && !header.hasClass('done')) {
      header.addClass('done').fadeOut(500);
      $('#WelcomeForm')
        .delay(500)
        .animate({backgroundColor: 'rgba(0,0,0,0.3)'}, 500);
      displayEl(formButton, true);
    }

    // input
    if (
      !nSubmit &&
      (i === 0 ||
        (i === 1 && testLength.test(nameVal)) ||
        (i === 2 && testEmail.test(emailVal)) ||
        (i === 3 && testLength.test(stateVal)))
    ) {
      if (!(i === 0)) {
        displayEl($('#WelcomeForm .formoption' + i), false);
      }

      i++;

      $('#ProgressBar').css({width: progress + '%'});
      progress += 33.333;

      displayEl($('#WelcomeForm .formoption' + i), true);
    }

    // submit
    if (i === 4) {
      nSubmit = true;

      i = 0;

      displayEl(success, true);

      setTimeout(function() {
        $.ajax({
          type: 'POST',
          url: 'PHP/welcomeform.php',
          data: $('#WelcomeForm').serialize()
        });

        $('#FN, #EA, #ST').val('');

        $('#ProgressBar').css({width: 0});
        progress = 0;

        displayEl(success, false);

        header.removeClass('done').fadeIn(1000);
        $('#WelcomeForm').animate({backgroundColor: 'rgba(0,0,0,0)'}, 1000);
        displayEl(formButton, false);

        setTimeout(function() {
          nSubmit = false;
        }, 1000);
      }, 1000);
    }
  });

  // display element *********
  function displayEl(el, display) {
    if (display) {
      el.css({display: 'block'})
        .delay(500)
        .animate({opacity: 1}, 500);
    } else {
      el.animate({opacity: 0}, 500, function() {
        $(this).css({display: 'none'});
      });
    }
  }
});

// PARTICLE ANIMATION *******************************
$(document).ready(function() {
  // initialization *********
  let canvas = document.getElementById('WelcomeParticles'),
    ctx = canvas.getContext('2d'),
    balls = [],
    lastTime = Date.now();

  // responsive canvas *********
  $(window)
    .on('resize', function() {
      canvas.width = $('#WelcomeSection').width();
      canvas.height = $('#WelcomeSection').height();
    })
    .resize();

  // loop *********
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    update();
    requestAnimationFrame(loop);
  }

  // ball *********
  function Ball(startX, startY, startVelX, startVelY) {
    // position
    this.x = startX || Math.random() * canvas.width;
    this.y = startY || Math.random() * canvas.height;

    // velocity
    this.vel = {
      x: startVelX || Math.random() - 0.5,
      y: startVelY || Math.random() - 0.5
    };

    // radius
    this.radius = (Math.random() + 1.1) * 2.5;

    // update
    this.update = function(canvas) {
      // reverse direction
      if (this.x > canvas.width + 50 || this.x < -50) {
        this.vel.x = -this.vel.x;
      }
      if (this.y > canvas.height + 50 || this.y < -50) {
        this.vel.y = -this.vel.y;
      }
      // update pos via vel
      this.x += this.vel.x;
      this.y += this.vel.y;
    };

    // draw
    this.draw = function(ctx) {
      ctx.beginPath();
      // alpha - transparency
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.globalCompositeOperation = 'destination-over';
      // ( x-coord, y-coord, radius, iAngle, fAngle, counterclockwise )
      ctx.arc(0.5 + this.x, 0.5 + this.y, this.radius, 0, 2 * Math.PI, false);
      ctx.fill();
    };
  }

  // ball array *********
  for (let i = 0; i < canvas.width * (canvas.height / (180 * 180)); i++) {
    // quantity based upon canvas dimensions
    balls.push(
      new Ball(Math.random() * canvas.width, Math.random() * canvas.height)
    );
  }

  // update *********
  function update() {
    const diff = Date.now() - lastTime;
    for (let frame = 0; frame * 16.6667 < diff; frame++) {
      for (let index = 0; index < balls.length; index++) {
        balls[index].update(canvas);
      }
    }
    lastTime = Date.now();
  }

  // draw *********
  function draw() {
    ctx.fillStyle = 'transparent';
    // ( startX, startY, width, height )
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // initial circle selection
    for (let indexOne = 0; indexOne < balls.length; indexOne++) {
      const ballOne = balls[indexOne];
      ballOne.draw(ctx);
      ctx.beginPath();
      // subsequent circle selection and segment manipulation
      for (let indexTwo = balls.length - 1; indexTwo > indexOne; indexTwo--) {
        const ballTwo = balls[indexTwo],
          // square root with respect to sum of squared args thus distance
          dist = Math.hypot(ballOne.x - ballTwo.x, ballOne.y - ballTwo.y);
        if (dist < 150) {
          ctx.strokeStyle = 'rgb(255,255,255)';
          // decrease alpha as distance increases
          ctx.globalAlpha = 1 - dist / 150;
          // segment initial pos
          ctx.moveTo(0.5 + ballOne.x, 0.5 + ballOne.y);
          // segment final pos
          ctx.lineTo(0.5 + ballTwo.x, 0.5 + ballTwo.y);
        }
      }
      // visualize defined path
      ctx.stroke();
    }
  }

  // commence *********
  loop();
});

// CAROUSEL *****************************************
$(document).ready(function() {
  // initialization *********
  let i = 1,
    img = '#Img1',
    interval,
    done = true;

  // init image *********
  $(img).addClass('showimg');

  // controls *********
  $('#CarouselControls img').click(function() {
    if (done) {
      // interval
      clearInterval(interval);
      interval = setInterval(auto, 5000);

      // right
      if (this.id === 'Right') {
        i < 18 ? i++ : (i = 1);
      }

      // left
      if (this.id === 'Left') {
        i > 1 ? i-- : (i = 18);
      }

      // animate
      ImageAnimation(i);

      // done
      done = false;
      setTimeout(function() {
        done = true;
      }, 500);
    }
  });

  // interval *********
  interval = setInterval(auto, 5000);

  // automation *********
  function auto() {
    i < 18 ? i++ : (i = 1);
    ImageAnimation(i);
  }

  // animation *********
  function ImageAnimation(num) {
    // remove current
    $(img).removeClass('showimg');
    $(img).addClass('hideimg');

    // set new
    img = '#Img' + num;

    // animate new
    $(img).removeClass('hideimg');
    $(img).addClass('showimg');
  }
});

// INFO SECTION ********************************
$(document).ready(function() {
  // init *********
  let done = true;

  // open *********
  $('#InfoButton').click(function() {
    if (done) {
      doneUtil();

      $('#WelcomeSection').animate({opacity: 0}, 2000);

      $('#InfoSection').animate({right: '0px', opacity: 1}, 1000, 'easeInExpo');
      $('#InfoSection .col.two').animate(
        {right: '0px', opacity: 1},
        2500,
        'easeOutQuart'
      );

      setTimeout(function() {
        $('#InfoSection .fade-in').css({opacity: '1'});
      }, 1500);
    }
  });

  // close *********
  $('#InfoSection #Close').click(function() {
    if (done) {
      doneUtil();

      $('#InfoSection').animate({opacity: 0}, 1000, function() {
        $('.reset-attr').removeAttr('style');
      });

      $('#WelcomeSection').animate({opacity: 1}, 3000);
    }
  });

  // done *********
  function doneUtil() {
    done = false;
    setTimeout(function() {
      done = true;
    }, 3000);
  }
});
