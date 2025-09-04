
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('.input-field');
            
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.parentElement.querySelector('i').style.transform = 'scale(1.2)';
                    this.parentElement.querySelector('i').style.opacity = '1';
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.querySelector('i').style.transform = 'scale(1)';
                    this.parentElement.querySelector('i').style.opacity = '0.8';
                });
            });
            
            // Add subtle floating animation to the login card
            const card = document.querySelector('.glass-card');
            let floatValue = 0;
            let floatDirection = 1;
            
            function floatCard() {
                floatValue += 0.02 * floatDirection;
                
                if (floatValue > 3) floatDirection = -1;
                if (floatValue < -3) floatDirection = 1;
                
                card.style.transform = `translateY(${floatValue}px)`;
                requestAnimationFrame(floatCard);
            }
            
            floatCard();
            
            // Add sphere interaction
            const spheres = document.querySelectorAll('.sphere');
            
            spheres.forEach(sphere => {
                sphere.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                    this.style.opacity = '1';
                });
                
                sphere.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.opacity = '0.8';
                });
            });
        });
