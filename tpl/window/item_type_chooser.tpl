<script id="tpl-item-type-chooser" type="text/x-dot-template">

<div class="window" style="width: 305px; height: 448px;">
<div class="header">
	<span>Create new item</span>

	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>

<div class="content flex-rows">
	<div class="flex-columns" style="align-items: baseline; margin-bottom: 2px;">
		<span>Search</span>
		<input type="text" id="search" style="flex: 1; margin-bottom: 4px;" autocomplete="off" tabindex="1"></input>
	</div>
	<div class="types">
		{assign count = 0}
		{for type of Item.types}
			{if $type.id == 0}{continue}{/if}
			<div class="type" id="type-{@$type.id}" onfocus="{serialize $win}.select_type('{@$type.id}')" ondblclick="this.onfocus(); {serialize $win}.next();" tabindex="{@2 + $count}" onkeydown="if (event.key === 'Enter') {serialize $win}.next();">{@$type.name}</div>
			{$count++}
		{/foreach}
	</div>
	<div style="flex: 1;"></div>
	<div style="margin-top: 8px;">
		<a class="button disabled" id="open" style="float: right;" onclick="{serialize $win}.next()">Next</a>
	</div>
</div>
</div>

{@@
<style>
.window {
	position: relative;
}

.window:before {
	content: '';
	width: 300vw;
	height: 300vh;
	position: absolute;
	left: -100vw;
	top: -100vh;
	background: #000;
	opacity: 0.5;
	user-events: none;
}

.window > .content {
	overflow: hidden;
}

.types {
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

.types > .type {
	padding: 1px 4px;
	margin: 0 -4px;
	border: 1px dashed transparent;
}

.types > .type {
	user-select: none;
}

.types > .type.selected{
	background-color: #f6e0e0;
	border: 1px dashed #000;
	outline: none;
}
</style>
@@}

</script>

