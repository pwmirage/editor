<script id="tpl-spawner-group-info" type="text/x-dot-template">

<div class="window popup square-left" style="position: absolute; width: 240px;">
<div class="content flex-rows" style="padding: 25px;">
	<span>
		{if $spawner.type == 'resource'}
			{assign obj = db.mines[$group.type]}
		{else}
			{assign obj = ($spawner.type == 'npc' ? db.npcs : db.monsters)[$group.type]}
		{/if}
		{@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$group.type}
	</span>
	{if $spawner.type != 'npc' || $spawner.groups?.length != 1}
		<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
			<span>Count:</span>
			<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'count'" style="width: 20px; margin-bottom: 4px" placeholder="0" size="1">
			<div style="flex: 1"></div>
			{if $spawner.type == 'monster'}
				<label><input type="checkbox" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'aggro'" class="checkbox"><span>Is Aggressive</span></label>
			{else if $spawner.type == 'resource'}
				<span>Y offset</span>
				<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'height_offset'" style="width: 30px; margin-bottom: 4px" placeholder="0" size="1">
			{/if}
		</div>
	{/if}

	{if $spawner.type == 'resource'}
		<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
			<span>Respawn time (sec):</span>
			<input type="number" data-link="{serialize $spawner} => 'groups', {@$group_idx}, 'respawn_time_sec'" style="width: 40px; margin-bottom: 4px" placeholder="0" size="1">
		</div>
	{else}
		<div class="flex-columns" style="align-items: center; margin-bottom: 4px;">
			<span>Path:</span>
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.path_id}
						(unnamed) #{@$group.path_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	{/if}

	{if $spawner.type == 'monster'}
		<div class="flex-columns flex-all" style="align-items: center;">
			<span>Group:</span>
			<span>Accept help group:</span>
		</div>

		<div class="flex-columns" style="align-items: center;">
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.group_id}
						(unnamed) #{@$group.group_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
			<a class="button no-break flex-columns" style="flex: 1;" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})">
				<span style="flex: 1;">
					{if $group.accept_help_group_id}
						(unnamed) #{@$group.accept_help_group_id}
					{else}
						(none)
					{/if}
				</span>
				<i class="fa fa-angle-right"></i>
			</a>
		</div>
	{/if}

</div>
</div>

{@@
<style>
.window:after {
	content: '';
	position: absolute;
	left: -1px;
	top: -2px;
	width: 12px;
	height: calc(100% + 3px);
	background-color: #fafafa;
}
</style>
@@}
</script>

<script id="tpl-spawner-rotation" type="text/x-dot-template">

<div class="window resizable" style="width: 300px; min-height: 100px; height: 170px;">
<div class="header">
	<span>
		<span>Change rotation of spawner <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span></span>
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns preview" style="align-items: center; margin-bottom: 2px;">
		<span>Previous Dir:</span>
		<span style="flex: 1;">{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000}</span>
	</div>
	<div class="flex-columns pos-input" style="align-items: center; margin-bottom: 8px;">
		<span>Dir (radians):</span>

		<input id="input" type="number" style="flex: 1;" value="{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000}">
	</div>
	<div style="display: flex; margin-right: 10px; column-gap: 8px;">
		<div style="flex: 1"></div>
		<a class="button" onclick="{serialize $win}.close()">Return</a>
	</div>
</div>
</div>

{@@
<style>
.preview > * {
	display: inline-block;
}
</style>
@@}
</script>


<script id="tpl-spawner-position" type="text/x-dot-template">

<div class="window resizable" style="width: 300px; min-height: 100px; height: 170px;">
<div class="header">
	<span>
		<span>Change position of spawner <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span></span>
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span style="visibility: hidden;">Previous Pos:</span>
		<span style="flex: 1;">X:</span>
		<span style="flex: 1;">Y:</span>
		<span style="flex: 1;">Z:</span>
	</div>
	<div class="flex-columns preview" style="align-items: center; margin-bottom: 2px;">
		<span>Previous Pos:</span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 0" data-placeholder="(0)"></span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 1" data-placeholder="(auto)"></span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 2" data-placeholder="(0)"></span>
	</div>
	<div class="flex-columns pos-input" style="align-items: center; margin-bottom: 5px;">
		<span style="margin-left: 30px;">Position:</span>

		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 0" data-placeholder="(0)"></span>
		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 1" data-placeholder="(auto)"></span>
		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 2" data-placeholder="(0)"></span>
	</div>
	<div style="display: flex; margin-right: 10px; column-gap: 8px;">
		<div style="flex: 1"></div>
		<a class="button" onclick="{serialize $win}.close()">Return</a>
	</div>
</div>
</div>

{@@
<style>
.preview > * {
	display: inline-block;
}
</style>
@@}
</script>


<script id="tpl-spawner" type="text/x-dot-template">

<div class="window resizable" style="width: 300px;">
<div class="header {if $spawner._removed}removed{/if}">
	<span>
		<span class="name">
			{if $spawner.type == 'resource'}Resource
			{else if $spawner.type == 'npc'}NPC
			{else}Monster{/if}
			&nbsp;Spawner 
		</span> <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span>
	</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns flex-all" style="align-items: center;">
		<a class="button" style="visibility:hidden; max-height: 0;" onclick="">Pos:</a>
		<span>X:</span>
		<span>Y:</span>
		<span>Z:</span>
	</div>
	<div id="position" class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
		<a class="button" onclick="{serialize $win}.pos_onclick(this, event);" oncontextmenu="event.preventDefault(); this.onclick(event);">Pos:</a>
		<span>{@Math.floor($spawner.pos[0] * 100) / 100}</span>
		<span>{assign ypos = Math.floor($spawner.pos[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>{@Math.floor($spawner.pos[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
		<a class="button" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})" oncontextmenu="event.preventDefault(); this.onclick(event);">Spread:</a>
		<span>{@Math.floor($spawner.spread[0] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[1] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[2] * 100) / 100}</span>
	</div>
	{if $spawner.type != 'resource'}
		<div id="rotation" class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
			<a class="button" onclick="{serialize $win}.dir_onclick(this, event);" oncontextmenu="event.preventDefault(); this.onclick(event);">Direction:</a>
			<span style="white-space: pre;">{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000} rad</span>
			<span></span>
			<span></span>
		</div>
	{/if}
	<div id="groups" class="flex-rows" style="margin-bottom: 5px;">
		{assign idx = 0}
		{foreach group of ($spawner.groups || [])}
			{if $spawner.type == 'resource'}
				{assign obj = db.mines[$group.type]}
			{else}
				{assign obj = db.npcs[$group.type] || db.monsters[$group.type]}
			{/if}
			<div class="group-row flex-columns">
				<div>{@$idx + 1}. {@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")}{if $group.type && $spawner.type != 'npc'} <span style="font-size: 12px; vertical-align: bottom;">x{@$group.count || 0}</span>{/if} {@DB.serialize_id($group.type)}</div>
				<div style="flex: 1;"></div>
				<a class="button no-break menu-triangle" onmousedown="{serialize $win}.open_group(this, {@$idx}, event);" oncontextmenu="event.preventDefault();" style="width: 13px; text-align: center;"><i class="fa fa-pencil-square-o"></i></a>
				<a class="group-hover button no-break" onmouseenter="{serialize $win}.info_group(this, {@$idx});" onclick="{serialize $win}.select_group(this.parentNode); event.stopPropagation();" style="margin-right: -10px;"><i class="fa fa-asterisk"></i></a>
			</div>
			{$idx++}
		{/foreach}
	</div>
	{if $spawner.type != 'npc'}
		<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
			<div style="flex: 1;"></div>
			<a class="button no-break" onclick="{serialize $win}.add_group()">(add) &nbsp;<i class="fa fa-plus" aria-hidden="true"></i></a>
		</div>
		<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
			<div class="no-break">Max groups:</div>
			<input type="number" style="flex: 1;" data-link="{serialize $win.spawner} => 'max_num'">
		</div>
	{/if}
	<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
		<div>Trigger:</div>
		<a class="button menu-triangle" data-link-button="{serialize $win.spawner} => 'trigger'" data-select="db.{@$win.spawner._db.type.replace('spawners_', 'triggers_')}" style="margin-top: 1px; margin-bottom: 1px;"></a>
	</div>
	{if $spawner.type != 'npc'}
		<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
			<div class="no-break">Lifetime: (sec) </div>
			<input type="number" style="flex: 1;" data-link="{serialize $win.spawner} => 'lifetime'">
		</div>
	{/if}
	{if $spawner.type == 'npc'}
		<div id="npc-group" style="min-height: 42px; flex: 1; display: flex; flex-direction: column; margin: 0 -12px;">
			{assign npc = db.npcs[$spawner.groups[0]?.type || 0]}
			{if !$npc}
				<div class="header"><span>-</span></div>
			{/if}
			<div id="npc-window" style="flex:1;"></div>
		</div>
	{/if}
</div>
</div>

{@@
<style>
.group-row {
	padding: 5px;
	background-color: #ececec;
	border: 1px solid #e0b0b0;
	align-items: center;
	margin-bottom: -1px;
	position: relative;
	box-sizing: border-box;
}

.group-row.selected:after {
	opacity: 0.175;
}

.group-row > .group-hover {
	height: 20px;
}

.group-row > .group-hover > .window {
	display: none;
	position: relative;
	border-left: none;
	align-self: start;
	top: -48px;
	right: -20px;
	width: 0;
}

.group-row.selected > .group-hover > .window,
#groups:not(.has-selected) > .group-row > .group-hover:hover > .window {
	z-index: 0 !important;
	display: block;
	margin-left: -1px;
}

</style>
@@}
</script>

