extends Node2D


# Declare member variables here. Examples:
# var a = 2
# var b = "text"


# Called when the node enters the scene tree for the first time.
func _ready():
	pass

var offset_range = 10
var desired_h_offset = 0
var current_h_offset = 0
var timing_h_offset = 0
var desired_v_offset = 0
var current_v_offset = 0
var timing_v_offset = 0

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	timing_h_offset += delta
	current_h_offset = lerp(current_h_offset, desired_h_offset, timing_h_offset)
	$Path2D/PathFollow2D.h_offset = current_h_offset

	timing_v_offset += delta
	current_h_offset = lerp(current_v_offset, desired_v_offset, timing_v_offset)
	$Path2D/PathFollow2D.v_offset = current_v_offset
	

	if $Path2D/PathFollow2D.h_offset == desired_h_offset:
		desired_h_offset = randi() % (offset_range * 2) - offset_range
		timing_h_offset = 0
	if $Path2D/PathFollow2D.v_offset == desired_v_offset:
		desired_v_offset = randi() % (offset_range * 2) - offset_range
		timing_v_offset = 0
