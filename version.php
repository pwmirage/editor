<?php
$time = filemtime('script');
$time = max($time, filemtime('tpl'));
$time = max($time, filemtime('css'));

echo json_encode(array(
	'mtime' => $time,
), JSON_FORCE_OBJECT | JSON_UNESCAPED_SLASHES);
?>
