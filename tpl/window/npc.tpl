<script id="tpl-npc-model" type="text/x-dot-template">
<div class="window" style="border: 30px solid rgba(1.0, 1.0, 1.0, 0.7);">
<div class="header">
	<span>
		Model: {@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$npc.id}
	</span>
	<div class="menu">
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div style="margin-bottom: 15px;">Double click to choose a new model:<br>(This page is still WIP, if you'd like to contribute, please send NPC names and their portrait pictures at <a href="mailto:admin@pwmirage.com">admin@pwmirage.com</a>)</div>
	<div class="flex-columns" style="flex-wrap: wrap; margin-top: -10px">
		{foreach mtype in NPCModelWindow.models}
			{assign model = NPCModelWindow.models[mtype]}
			{assign selected = $npc.file_model == $model.file}
			<div class="model {if $selected}selected{/if}" style="background-image: url('/editor/img/npc/{@mtype}.webp')" data-type="{@mtype}" data-onclick="win.select('{@mtype}');" data-ondblclick="win.choose('{@mtype}');"></div>
		{/foreach}
	</div>
</div>
</div>

TEMPLATE_END
<style>
.model {
	width: 150px;
	height: 150px;
	background-color: #4b2721;
	margin-top: 10px;
	border: 1px solid #000;
	position: relative;
}

.model.selected {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid #444;
}

.model.selected:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #fff;
	opacity: 0.2;
}
</style>
</script>

<script id="tpl-npc" type="text/x-dot-template">

<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>
		{@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$npc.id}
	</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 8px;">
		<span style="width: 45px;">Name:</span>
		<input type="text" style="flex: 1; width: 100%;" placeholder="(unnamed)" data-link="win.npc => 'name'">
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-top: -8px">
		<div class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Type:</span>
			<select id="type" style="">
				<option value="npc">NPC</option>
				<option value="guard">Guard</option>
			</select>
		</div>
		<div id="model" class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Model:</span>
			{assign name = "(default)"}
			{foreach mtype in NPCModelWindow.models}
				{if NPCModelWindow.models[mtype].file == $npc.file_model}
					{assign name = NPCModelWindow.models[mtype].name}
				{/if}
			{/foreach}

			<a class="button" data-onclick="win.choose_model();">{@$name}&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center; justify-content: space-between;">
		<div>
			<span style="margin-right: 8px;">Sell:</span>
			{assign sells = db.npc_sells[$npc.id_sell_service];}
			<a class="button" data-onclick=";">{@ $sells?._name ?? ($sells ? ($sells.name || "(unnamed)") : "(none)" ) }&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
		<div>
			<span style="margin-right: 8px;">Craft:</span>
			{assign craft = db.npc_crafts[$npc.id_make_service];}
			<a class="button" data-onclick=";">{@ $craft?._name ?? ($craft ? ($craft.name || "(unnamed)") : "(none)" ) }&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
	</div>
	<div>Greeting:</div>
	<div style="position:relative; flex: 1; margin-bottom: 18px">
		<code contenteditable="true" data-onkeyup="win.update_caret();" data-onmouseup="win.update_caret();" data-onpaste="setTimeout(() => win.save_greeting(), 1);" data-oninput="win.format_greeting();">
			{@$npc.greeting?.replace('\n', '<br>') || ""}
		</code>
		<div class="color" data-onclick="win.insert_color();">
			<i class="fa fa-adjust"></i>
		</div>
	</div>
</div>
</div>

TEMPLATE_END
<style>
code {
	-moz-appearance: textfield;
	-webkit-appearance: textfield;
	border: 1px solid #e0b0b0;
	padding: 2px 3px;
	outline: none !important;
	background-color: #3a3a3a;
	color: #fff;
	width: calc(100% - 8px);
	height: 100%;
	white-space: pre-wrap;
}

.color {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 13px;
	height: 19px;
	color: #ffffff;
	margin-bottom: -6px;
	border: 1px solid #fafafa;
	padding: 3px 5px;
}

.color:hover {
	background-color: #6b6b6b;
}

.hidden {
	visibility: hidden;
	position: absolute;
}

input[type="color"] {
	width: 20px;
	background-color: transparent;
	border: none;
	padding: 0;
	margin: 0;
	transform: translateY(3px);
	outline: none;
}
</style>

</script>

