await provider.render(ProductDetails, {
  sku: 'VSK087',

  slots: {
    Title: (ctx) => {
      const title = document.createElement('h1');
      title.style.fontSize = '2rem';
      title.style.margin = 0;

      ctx.replaceWith(title);

      // Prepend In Stock
      const inStock = document.createElement('span');
      inStock.style.fontSize = '0.35em';
      inStock.style.color = 'white';
      inStock.style.padding = '0 1em';
      inStock.style.marginBottom = '1rem';
      inStock.style.borderRadius = '4px';
      inStock.style.display = 'inline-block';

      ctx.prependSibling(inStock);

      // create Ratings
      const reviews = document.createElement('div');
      reviews.style.fontSize = '.85em';
      reviews.style.margin = '0.5rem 0';
      reviews.innerText = '⭐⭐⭐⭐⭐';

      // append after title
      ctx.appendSibling(reviews);

      // Lifecycle
      ctx.onChange((next) => {
        title.innerText = `👋 ${next.data?.name}`;

        if (next.data.inStock) {
          inStock.innerText = 'In Stock';
          inStock.style.backgroundColor = 'green';
        } else {
          inStock.innerText = 'Out of Stock';
          inStock.style.backgroundColor = 'red';
        }
      });
    },

    Quantity: (ctx) => {
      const label = document.createElement('div');
      label.style.fontSize = '.85em';
      label.innerText = 'Quantity:';
      ctx.prependChild(label);

      ctx.onChange((next) => {
        label.innerText = `${next.dictionary.Custom.quantityLabel}:`;
      });
    },

    Options: (ctx) => {
      const size = ctx.getSlotElement('product-swatch--fashion_size');

      // Add link to Sizes
      if (size) {
        // Create Size Link
        const link = document.createElement('a');
        link.href = '#';
        link.style.fontSize = '.85em';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Size Chart');
        });
        // append inside size
        size.appendChild(link);
        ctx.onChange((next) => {
          link.innerText = next.dictionary.CustomButtons.SizeChart.label;
        });
      }
    },

    Actions: (ctx) => {
      const banner = document.createElement('div');
      banner.style.backgroundColor = 'lightblue';
      banner.style.padding = '1rem';
      banner.style.textAlign = 'center';
      banner.style.height = '100px';
      banner.style.display = 'flex';
      banner.style.alignItems = 'center';
      banner.style.justifyContent = 'center';
      banner.innerText = '👋 Hello!';
      banner.addEventListener('click', () => console.log('Hello!'));

      // Add to Cart Button
      ctx.appendButton((next, state) => {
        const adding = state.get('adding');

        return {
          text: adding
            ? next.dictionary.CustomButtons.AddingToCart.label
            : next.dictionary.PDP.Product.AddToCart.label,
          icon: 'Cart',
          variant: 'primary',
          disabled: adding || !next.data?.inStock || !next.valid,
          onClick: () => {
            state.set('adding', true);
            console.log('Add To Cart', next.values);

            setTimeout(() => {
              state.set('adding', false);
            }, 2000);
          },
        };
      });

      // // Add to Wishlist Button
      ctx.appendButton((next) => ({
        'aria-label': next.dictionary.CustomButtons.AddToWishlist.label,
        icon: 'Heart',
        variant: 'primary',
        disabled: !next.valid,
        onClick: () => console.log('Add To Wishlist', next.values),
      }));

      // // Add Concierge Button
      ctx.appendButton((next) => ({
        text: next.dictionary.CustomButtons.CallConcierge.label,
        variant: 'secondary',
        onClick: () => console.log('Call Concierge'),
      }));

      ctx.appendButton((next) => ({
        text: 'Link',
        href: '#link',
        variant: 'tertiary',
      }));

      ctx.appendChild(banner);
    },
  },

  carousel: {
    controls: 'thumbnailsColumn',
    mobile: true,
  },
})(document.getElementById('pdp'));
