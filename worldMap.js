const _ = require('underscore');

//_.range(0, 200).forEach((e,i) => { d[i] = {}; });

let d = {
  97: {
    101: "Trading Post.",
    102: "Trading Post Antechamber.",
  },
  98: {
    98: "The northwest corner of a small brick plaza.",
    99: "The west edge of a small brick plaza.",
    100: "The west edge of a small brick plaza.",
    101: "The west edge of a small brick plaza.",
    102: "The southwest corner of a small brick plaza.",
  },
  99: {
    98: "The north edge of a small brick plaza.",
    99: "Northwest of the middle of a small brick plaza.",
    100: "West of the middle of a small brick plaza.",
    101: "Southwest of the middle of a small brick plaza.",
    102: "The south edge of a small brick plaza.",
  },
  100: {
    91: "North Gate. The entrance to the town. To the north a road leads into the wilderness. To the south, a walkway leads into town.",
    92: "A narrow brick north-south walkway, lined by small brick buildings.",
    93: "A narrow brick north-south walkway, lined by small brick buildings.",
    94: "A narrow brick north-south walkway, lined by small brick buildings.",
    95: "A narrow brick north-south walkway, lined by small brick buildings.",
    96: "A narrow brick north-south walkway, lined by small brick buildings.",
    97: "A narrow brick north-south walkway, lined by small brick buildings.",
    98: "The north edge of a small brick plaza.",
    99: "North of the middle of a small brick plaza.",
    100: "The middle of a small brick plaza, 50 feet square, surrounded by small brick buildings.",
    101: "South of the middle of a small brick plaza.",
    102: "The south edge of a small brick plaza.",
  },
  101: {
    91: "North Gatehouse.",
    98: "The north edge of a small brick plaza.",
    99: "Northeast of the middle of a small brick plaza.",
    100: "East of the middle of a small brick plaza.",
    101: "Southeast of the middle of a small brick plaza.",
    102: "The south edge of a small brick plaza.",
  },
  102: {
    98: "The northeast corner of a small brick plaza.",
    99: "The east edge of a small brick plaza.",
    100: "The east edge of a small brick plaza.",
    101: "The east edge of a small brick plaza.",
    102: "The southeast corner of a small brick plaza.",
  },
};

_.range(90, 111).forEach((e) => {
  d[e] || (d[e] = {});
  _.range(80, 90).forEach((e2) => {
    d[e][e2] = "Northern Wilderness.";
  })
});

_.range(90, 111).forEach((e) => {
  d[e][90] = "Northern Wall.";
});

_.range(80, 91).forEach((e) => {
  d[100][e] = "Northern Road. Straying from the road is unsafe!.";
});


$roomId = 1;
$rooms = array();

for ($y=70; $y<=110; $y++)
{
	for ($x=90; $x<=110; $x++)
	{
		makeRoom( $x, $y );
	}
}

//makeRoom( 100, 100 );

foreach (array_keys( $rooms ) as $x)
{
	foreach (array_keys( $rooms[$x] ) as $y)
	{
		print 
			"[$x][$y]" .
			"[" . $rooms[$x][$y]['id'] . "]" .
			"[" . $rooms[$x][$y]['desc'] . "]" .
			"[" . $rooms[$x][$y]['items'] . "]" .
			"\n";
	}
}

exit;

function makeRoom( $x, $y )
{
	global $roomId, $rooms, d;

	if ($x < 1 or $x > 200 or $y < 1 or $y > 200)
		return;

	$items = '';
	if (rand( 1, 10 ) == 1) $items .= "gold_$roomId,";
	if (rand( 1, 10 ) == 1) $items .= "scroll_$roomId,";
	if (rand( 1, 10 ) == 1) $items .= "shield_$roomId,";
	if (rand( 1, 10 ) == 1) $items .= "dagger_$roomId,";
	$items = preg_replace( "/,$/", '', $items );

	$color = sprintf( "#%02X%02X%02X", ($x-50) * 4, ($y-50) * 4, 200 );

	$desc = "<span style=\"background-color: $color; \">";
	if (isset( d[$x][$y] )) $desc .= d[$x][$y];
	$desc .= " (Location $roomId)";
	$desc .= "</span>";

	$rooms[$x][$y]['id'] = $roomId;
	$rooms[$x][$y]['desc'] = $desc;
	$rooms[$x][$y]['items'] = $items;

	$roomId++;
}




*/
