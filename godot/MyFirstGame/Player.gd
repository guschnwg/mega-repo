extends Area2D

var screen_size # Size of the game window.
export var speed = 100

var shake = false

func _ready():
	screen_size = get_viewport_rect().size

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	var velocity = Vector2.ZERO # The player's movement vector.
	if Input.is_action_pressed("move_right"):
		velocity.x += 1
	if Input.is_action_pressed("move_left"):
		velocity.x -= 1
	if Input.is_action_pressed("move_down"):
		velocity.y += 1
	if Input.is_action_pressed("move_up"):
		velocity.y -= 1

	if velocity.length() > 0:
		velocity = velocity.normalized() * speed
		if $Sprite.rotation == 0:
			$Sprite.rotation = 0.1
		$Sprite.offset.y = 0

		if velocity.x != 0:
			$Sprite.flip_h = velocity.x < 0
	else:
		$Sprite.rotation = 0
		if $Sprite.offset.y == 0:
			$Sprite.offset.y = 0.6

	if shake:
		shake = false
		$Sprite.rotation *= -1
		$Sprite.offset.y *= -1
		$ShakeTimer.start()
 
	position += velocity * delta
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)


func _on_ShakeTimer_timeout():
	shake = true
