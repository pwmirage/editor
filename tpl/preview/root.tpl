<script id="pw-preview-root" type="text/x-jstemplate">
{if $has_local_changes}
	<span style="font-weight: bold;">Has non-published changes</span>
{/if}
<div id="container">
	{assign i = 0}
	{assign max_items = parseInt($preview.dataset.maxItems)}
	{for obj of $objects}
		{if ++$i >= $max_items}
			<div onclick="">
				<img style="visibility: hidden; width: 0;">
				<span>+ {@$max_items - $i} more</span>
			</div>
			{break}
		{/if}

		<div onclick="">
			<img src="{@PWPreview.get_obj_img($db, $obj)}">
			<span>{@$obj.name || PWPreview.get_obj_type(obj).name } {@serialize_db_id($obj.id)}</span>
		</div>
	{/for}
	{if $objects.length == 0}
		<span>No changes</span>
	{/if}
</div>

{@@
<style>
:host {
	display: block;
	position: static;
	height: 280px;
}

#container {
	position: absolute;
	display: flex;
	flex-wrap: wrap;
	column-gap: 5px;
	align-items: baseline;
	margin-top: -3px;
	overflow: hidden;
	font-size: 14px;
}

#more-objects,
#container > div {
	background-color: #dccfcf;
	border-radius: 2px;
	border-width: 0;
	color: rgba(33, 33, 33, 1);
	cursor: pointer;
	display: flex;
	font-weight: 400;
	margin: 0;
	padding: 4px;
	padding-right: 6px;
	text-decoration: none;
	line-height: 1.48;
	user-select: none;
	column-gap: 3px;
	width: 187px;
	height: 32px;
	margin-top: 5px;
	overflow: hidden;
}

#more-objects:hover,
#container > div:hover {
	background-color: rgba(156, 120, 120, 1);
	color: rgba(255, 255, 255, 1);
	text-decoration: none;
}

#more-objects {
	display: none;
	line-height: 31px;
	min-width: 75px;
	text-align: center;
	overflow: hidden;
}

#container > div > img {
	width: 32px;
	height: 32px;
}

#container > div > span {
	align-self: center;
	line-height: 16px;
	overflow: hidden;
	margin: auto;
	margin-left: 0;
}

</style>
@@}
</script>
