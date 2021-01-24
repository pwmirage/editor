<script id="tpl-create-project" type="text/x-dot-template">

<div class="window" style="width: 455px;">
<div class="header">
	<span>Create Project</span>

	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>

<div class="content flex-rows">
	<span style="margin-bottom: 8px;">Projects are used to organize your work. Each project is meant to contain a singular change that can be reviewed, approved, and merged to the game. The less changes a project contains, the better, since smaller projects can be reviewed faster. Projects are only visible to the author until they're published (Top menu->Project->Publish). Changes made in the editor outside any project are only stored inside your browser, hence it's recommended to always be in a project.</span>
	<span style="margin-bottom: 8px;">Please type a name for this project. It's only a cosmetic used for identification and can be modified at any time until the project is merged.</span>
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span>Name:</span>
		<input type="text" id="name" style="flex: 1; width: 100%; margin-bottom: 4px;" oninput="{serialize $win}.oninput(this);" autocomplete="off"></input>
	</div>
	<label title="You choose to transfer current changes to the newly created project or leave them be, which will keep them as-is in your browser data"><input type="checkbox" class="checkbox" id="transfer-changes" checked><span>Transfer current changes</span><i class="fa fa-info-circle" style="cursor: help; margin-left: 4px;"></i></label>
	<div style="margin-top: 8px;">
		<span id="err"></span>
		<a class="button disabled" id="submit" style="float: right;" onclick="{serialize $win}.submit()">Create</a>
	</div>
</div>
</div>

{@@
<style>
.window > .content {
	overflow: hidden;
}

#err {
	transition: opacity 0.2s ease-in-out;
	color: red;
	font-weight: bold;
	opacity: 1;
}

#err:empty {
	opacity: 0;
}
</style>
@@}

</script>

