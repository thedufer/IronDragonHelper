window.S = function(tag, attrs) {
  el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for(k in attrs) {
    if(k == 'text')
      el.appendChild(document.createTextNode(attrs[k]));
    else
      el.setAttribute(k, attrs[k]);
  }
  return el
}

jQuery.fn.hasClass = function(className) {
  return RegExp("\\b" + className + "\\b").test(this.attr('class'));
};

jQuery.fn.addClass = function(className) {
  this.each(function() {
    var $this;
    $this = $(this);
    if ($this.hasClass(className)) {
      return;
    }
    if ($this.attr('class') != null) {
      return $this.attr('class', $this.attr('class') + ' ' + className);
    } else {
      return $this.attr('class', className);
    }
  });
  return this;
};

jQuery.fn.removeClass = function(className) {
  this.each(function() {
    var $this;
    $this = $(this);
    return $this.attr('class', function() {
      return $this.attr('class').replace(new RegExp(className, 'g'), '');
    });
  });
  return this;
};

window.lowerCaseCities = [];
for(mapName in window.cities) {
  for(loc in window.cities[mapName]) {
    var cityName = window.cities[mapName][loc];
    window.lowerCaseCities.push(cityName.toLowerCase());
  }
}

window.numToTileClass = {
  "U": "underground-rock",
  "E": "underground-entrance",
  "P": "plains",
  "M": "mountain",
  "J": "jungle",
  "F": "forest",
  "A": "alpine",
  "D": "desert",
  "T": "port",
  "V": "volcano",
  "1": "small-city",
  "2": "medium-city",
  "3": "large-city",
  "0": "ocean"
};

var stringifyPoints = function(points) {
  return (points.map(function(a) {
    return "" + a.x + "," + a.y;
  })).join(' ');
};

var getHex = function(radius, className, x, y) {
  var coordinateAtCorner, i, points;

  coordinateAtCorner = function(corner) {
    var angle;
    angle = (i + 0.5) * Math.PI * 2.0 / 6.0;
    return {
      x: Math.cos(angle) * radius + x,
      y: Math.sin(angle) * radius + y
    };
  };

  points = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < 6; i = ++_i) {
      _results.push(coordinateAtCorner(i));
    }
    return _results;
  })();

  return S('polygon', {
    points: stringifyPoints(points),
    "class": className
  });
}

$(function() {
  // Set up map data properly
  var mainData = {};
  mainData.board = window.mainMap;
  mainData.boardHeight = mainData.board.length;

  var undergroundData = {};
  undergroundData.board = window.undergroundMap;
  undergroundData.boardHeight = undergroundData.board.length;

  var mainSVG = $("#mainSVG");
  var undergroundSVG = $("#undergroundSVG");
  var div = $(".js-show-stuff");
  var drawMap = function(mapData, $svg, mapName) {

    var hexWidth = 20;
    var hexHeight = Math.sqrt(3) * hexWidth / 2;
    var hexRadius = hexWidth / Math.sqrt(3) + 0.3;

    var backgroundMargin = hexWidth;

    for(var y = 0;y < mapData.boardHeight;y++) {
      for(var x = 0;x < mapData.board[y].length;x++) {
        (function(x, y) {
          var xOffset = backgroundMargin + (y % 2 == 0 ? 0 : hexWidth / 2);
          var yOffset = backgroundMargin;

          var cityName;
          var niceCityName = "";
          if(cityName = window.cities[mapName][x + "," + y]) {
            niceCityName = " " + cityName.toLowerCase().replace(' ', '-');
          }

          var hex = getHex(hexRadius, numToTileClass[mapData.board[y][x]] + " tile" + niceCityName, xOffset + x * hexWidth, yOffset + y * hexHeight);
          $svg.append(hex);
          var $hex = $(hex);
          $hex.on('click', function() {
            div.html(x + "," + y);
          });
          $hex.on('mouseenter', function() {
            $svg.append(hex);
          });
        })(x, y);
      }
    }
  };
  drawMap(mainData, mainSVG, "main");
  drawMap(undergroundData, undergroundSVG, "underground");

  $cityInput = $("#city-input");
  $cityInput.on("input", function() {
    $(".highlighted-city").removeClass('highlighted-city');
    var textArr = $cityInput.val().toLowerCase().split(' ');
    for(var j = 0;j < textArr.length;j++) {
      var text = textArr[j];
      if(!text) continue;
      for(var i = 0;i < window.lowerCaseCities.length;i++) {
        var cityName = window.lowerCaseCities[i];
        if(cityName.indexOf(text) == 0) {
          $("." + cityName.replace(' ', '-')).addClass('highlighted-city');
        }
      }
      for(var resource in window.resourceToCities) {
        if(resource.indexOf(text) == 0) {
          var cities = window.resourceToCities[resource];
          for(var i = 0;i < cities.length;i++) {
            $("." + cities[i].replace(' ', '-')).addClass('highlighted-city');
          }
        }
      }
    }
  });

});
