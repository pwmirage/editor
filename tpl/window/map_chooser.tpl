<script id="tpl-map-chooser" type="text/x-dot-template">

<div class="window" style="width: 405px; height: 448px;">
<div class="header">
	<span>
		{if WCF.User.userID}
			Welcome, {@WCF.User.username}
		{else}
			Welcome
		{/if}
	</span>
	<div class="menu">
		{if g_map}
			<i class="minimize fa" aria-hidden="true"></i>
			<i class="maximize fa" aria-hidden="true"></i>
			<i class="close fa fa-close" aria-hidden="true"></i>
		{/if}
	</div>
</div>
<div class="content flex-rows">
	<span style="margin-bottom: 8px;">Choose a map to edit</span>
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span>Search</span>
		<input type="text" id="search" style="flex: 1; width: 100%; margin-bottom: 4px;" autocomplete="off"></input>
	</div>
	<div class="maps">
		{foreach $maps as map}
			<div class="map" id="map-{@$map.id}" data-onclick="win.select_map('{@$map.id}')" >{@$map.name}</div>
		{/foreach}
	</div>
	<div style="flex: 1;"></div>
	<div style="margin-top: 8px;">
		<a class="button disabled" id="open" style="float: right;" data-onclick="win.open_map()">Open</a>
	</div>
</div>
</div>

TEMPLATE_END
<style>
.window > .content {
	overflow: hidden;
}

.maps {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	background-color: rgba(251, 241, 241, 1);
	border: 1px solid rgba(224, 176, 176, 1);
	color: rgba(80, 44, 44, 1);
	font-weight: 400;
	outline: none;
	padding: 4px 8px;
}

.maps > .map {
	padding: 3px 4px;
	margin: 0 -4px;
	border: 1px dashed transparent;
}

.maps > .map:active {
	background-color: #f6e0e0;
}

.maps > .map.selected{
	background-color: #f6e0e0;
	border: 1px dashed #000;
}
</style>

</script>

