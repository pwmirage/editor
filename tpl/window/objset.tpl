<script id="tpl-objset" type="text/x-dot-template">

<div class="window resizable narrow" style="width: 300px; height: 470px;"">
<div class="header">
	<span>
		Set: {@$obj.name || ''} {@DB.serialize_id($obj.id)}
	</span>
	<div class="menu">
		<i class="refresh fa fa-refresh"></i>
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 45px;">Name:</span>
		<span data-input style="flex: 1;" data-link="{serialize $obj} => 'name'" data-placeholder="(unnamed)" class="{if $obj.id == PWDB.metadata_types.objset_modified}disabled{/if}"></span>
	</div>
	<div id="entries" oncontextmenu="return false;">
		{if $obj.id == PWDB.metadata_types.objset_modified}
			{assign entries = db.project_modified_objects}
			{assign keys = $entries}
		{else}
			{assign entries = $obj.entries}
			{assign keys = Object.keys($entries)}
		{/if}
		{assign cnt = 0}
		{for e of $keys}
			{if $obj.id == PWDB.metadata_types.objset_modified}
				{assign eobj = $e}
			{else}
				{if !$entries[$e]}
					{continue}
				{/if}
				{assign match = e.match(/^(.+)_([0-9]+)\$/) || []}
				{assign eobj = db[$match[1]][$match[2]]}
			{/if}
			{assign details = PWPreview.get_obj_type($eobj)}
			<div>
				<a class="button" onclick="{serialize $win}.focus_btn(this); {serialize $details.open_fn}()" oncontextmenu="{serialize $win}.select_btn(this); return false;">
					<img src="{@PWPreview.get_obj_img(db, $eobj)}">
					<span>{@$win.print_obj_name($eobj, $details)}</span>
				</a>
				{if $obj.id !== PWDB.metadata_types.objset_modified}
					<i class="remove fa fa-trash" onclick="{serialize $win}.remove_obj('{@$eobj._db.type}', {@$eobj.id});"></i>
				{/if}
			</div>
			{$cnt++}
		{/for}
		{if $cnt == 0}
			<span>None</span>
		{/if}
	</div>
</div>
</div>

{@@
<style>
.window > .content {
	overflow: hidden;
}

#entries {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	outline: none;
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	padding-right: 4px;
}

.window.narrow #entries {
	flex-direction: column;
	flex-wrap: nowrap;
}

#entries > * {
	display: flex;
}

#entries .button {
	width: fit-content;
	display: flex;
	align-items: center;
	column-gap: 4px;
	padding: 6px;
	border: 1px solid transparent;
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
}

#entries .button img {
	width: 24px;
	height: 24px;
}

#entries *.selected {
	background: #a7dba7;
	border: 1px solid green;
}

#entries *.selected:hover {
	background: darkgreen;
}

#entries *.focused {
	border: 1px solid black;
}

.window.narrow #entries *.focused {
	margin-left: 6px;
}

.window.narrow #entries *.selected:not(.focused) {
	margin-left: 3px;
}

#entries .remove {
	color: #680000;
	font-size: 14pt;
	background: #cbbdbd;
	border-left: 1px solid #af9b9b;
	padding: 10px;
	border-top-right-radius: 2px;
	border-bottom-right-radius: 2px;
	cursor: pointer;
}

#entries .remove:hover {
	background: #9c7878;
}

</style>
@@}
</script>

