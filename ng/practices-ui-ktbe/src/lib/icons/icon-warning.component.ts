import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-warning',
    template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1505_961)">
            <path
                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                fill="#4776B1"
            />
            <path
                d="M13.0072 13.9633H11.1104L10.9014 4.6459H13.224L13.0072 13.9633ZM10.8395 17.5865C10.8347 17.4284 10.8619 17.2709 10.9197 17.1236C10.9774 16.9763 11.0645 16.8422 11.1755 16.7295C11.2969 16.6132 11.4409 16.5229 11.5985 16.4645C11.7562 16.406 11.9242 16.3806 12.0921 16.3896C12.26 16.3806 12.428 16.406 12.5857 16.4645C12.7434 16.5229 12.8874 16.6132 13.0088 16.7295C13.1193 16.8424 13.2058 16.9764 13.2631 17.1235C13.3205 17.2707 13.3475 17.4279 13.3424 17.5858C13.3466 17.7397 13.3199 17.8929 13.2638 18.0362C13.2076 18.1796 13.1233 18.3102 13.0157 18.4204C12.8925 18.5374 12.7463 18.6278 12.5864 18.6856C12.4265 18.7434 12.2564 18.7675 12.0867 18.7564C11.9186 18.7662 11.7502 18.7415 11.592 18.6837C11.4338 18.6259 11.2892 18.5363 11.167 18.4204C11.0591 18.3103 10.9745 18.1798 10.9181 18.0364C10.8617 17.893 10.8347 17.7398 10.8387 17.5858L10.8395 17.5865Z"
                fill="white"
            />
            <g clip-path="url(#clip1_1505_961)">
                <path d="M-103 -48.7815L-53 51.2185L-3 -48.7815H-103Z" stroke="black" stroke-width="12" />
                <path d="M27 48.2185H127L77 -51.7815L27 48.2185Z" stroke="black" stroke-width="12" />
            </g>
        </g>
        <defs>
            <clipPath id="clip0_1505_961">
                <rect width="24" height="24" fill="white" />
            </clipPath>
            <clipPath id="clip1_1505_961">
                <rect width="250" height="120" fill="white" transform="translate(-113 -58.7815)" />
            </clipPath>
        </defs>
    </svg> `,
})
export class PuibeIconWarningComponent extends PuibeIconDirectiveBase {}
