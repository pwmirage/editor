<script id="tpl-task" type="text/x-dot-template">

<div class="window resizable" style="width: 304px; min-height: 250px;">
<div class="header">
	<span>Task {@serialize_db_id($task.id)}</span>
	<div class="menu">
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<span>{@JSON.stringify($task)}</span>
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
</style>
@@}
</script>

