extends KinematicBody2D

export var speed = 10
export var max_speed = 50
export(PackedScene) var player
var screen_size
var should_change_direction = true
var go_to_position = Vector2.ZERO
var look_at_position = Vector2.ZERO
var half_speed = false
var time_to_change_direction = 3

func _ready():
	$Timer.start()
	$RayCast2D.add_exception(player)
	screen_size = get_viewport_rect().size

func _process(delta):
	$RayCast2D.cast_to = $RayCast2D.to_local(player.global_position)

	if $RayCast2D.is_colliding():
		half_speed = true
		var can_walk_front = $RayCast2DWalkFront.is_colliding()
		var global_cast = $RayCast2DWalkFront.to_global($RayCast2DWalkFront.cast_to)
		var is_out_of_bounds = global_cast.x > screen_size.x or global_cast.x < 0 or global_cast.y > screen_size.y or global_cast.y < 0
		if should_change_direction or can_walk_front or is_out_of_bounds:
			should_change_direction = false

			var random_position = global_position + Vector2(
				randi() % 200 - 100,
				randi() % 200 - 100
			)
			go_to_position = random_position
			look_at_position = random_position

			time_to_change_direction = 3
		else:
			time_to_change_direction -= delta
			if time_to_change_direction <= 0:
				should_change_direction = true
	else:
		half_speed = false
		go_to_position = player.position
		look_at_position = player.global_position
		should_change_direction = true

	var motion = position.direction_to(go_to_position) * speed
	move_and_slide(motion if not half_speed else motion / 2)
	look_at(look_at_position)


func _on_VisibilityNotifier2D_screen_exited():
	queue_free()


func _on_Timer_timeout():
	speed += 10

	$AnimatedSprite.show()
	$AnimatedSprite.play()
	
	if speed < max_speed:
		$Timer.start()


func _on_AnimatedSprite_animation_finished():
	$AnimatedSprite.hide()
