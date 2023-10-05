extends KinematicBody2D

export var speed = 10
export(PackedScene) var player

func _ready():
	$Timer.start()

func _process(delta):
	# TODO: fix this to avoid collision
	var motion = Vector2.ZERO
	motion += position.direction_to(player.position)
	motion *= speed
	move_and_slide(motion)
	
	# Sprite need to be correctly rotated
	look_at(player.position)
	rotation_degrees += 90


func _on_VisibilityNotifier2D_screen_exited():
	queue_free()


func _on_Timer_timeout():
	speed += 10

	$AnimatedSprite.show()
	$AnimatedSprite.play()
	$Timer.start()


func _on_AnimatedSprite_animation_finished():
	$AnimatedSprite.hide()
