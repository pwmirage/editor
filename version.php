<?php
$time = filemtime('script');
$time = max($time, filemtime('tpl'));
$time = max($time, filemtime('css'));

echo json_encode(array(
	'mtime' => 1, //$time,
), JSON_FORCE_OBJECT | JSON_UNESCAPED_SLASHES);
?>
